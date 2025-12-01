import crypto from 'crypto';
import logger from '../../utils/logger';

// In-memory storage for rate limiting
const rateLimits = new Map(); // IP -> { count: number, resetTime: number }
const blockedIPs = new Map(); // IP -> unblockTime

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes
const TTL_DURATION = 60 * 60 * 1000; // 60 minutes

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '127.0.0.1';
}

function isIPBlocked(ip) {
  const blockTime = blockedIPs.get(ip);
  if (blockTime && Date.now() < blockTime) {
    return true;
  }
  if (blockTime) {
    blockedIPs.delete(ip);
  }
  return false;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimits.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    limit.count++;
  }

  rateLimits.set(ip, limit);

  if (limit.count > RATE_LIMIT_MAX) {
    blockedIPs.set(ip, now + BLOCK_DURATION);
    return false;
  }

  return true;
}

function encryptCookie(data, key) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const keyBuffer = crypto.scryptSync(key, 'salt', 32); // Derive proper 32-byte key
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

function decryptCookie(encryptedData, key) {
  try {
    const algorithm = 'aes-256-cbc';
    const keyBuffer = crypto.scryptSync(key, 'salt', 32); // Derive proper 32-byte key
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, Buffer.from(encryptedData.iv, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    logger.error(`decryptCookie error: ${error.message}`);
    return null;
  }
}

export default function handler(req, res) {

  const ip = getClientIP(req);

  logger.debug(`schk API:INIT: IP: ${ip}, Method: ${req.method}, headers: ${JSON.stringify(req.headers)}, body: ${JSON.stringify(req.body)}`);

  if (isIPBlocked(ip) && process.env.NODE_ENV !== 'development') {
    logger.info(`schk API:INIT: Blocked IP attempt: ${ip}`);
    return res.status(403).json({ status: 'error' });
  }

  // POST to construct an encrypted cookie with TTL and return it in the Set-Cookie header
  if (req.method === 'POST') {
    // Mode 1: Client key authentication
    if (!checkRateLimit(ip)) {
      logger.error(`schk API:POST: Rate limit exceeded for IP: ${ip}`);
      return res.status(400).json({ status: 'error' });
    }
    const schkKey = process.env.SCHK_KEY;
    const cookieKey = process.env.COOKIE_KEY;

    if (!schkKey || !cookieKey) {
      logger.error(`schk API:POST: Missing SCHK_KEY or COOKIE_KEY in environment`);
      return res.status(500).json({ status: 'error' });
    }

    const { CLIENT_KEY } = req.body;

    if (!CLIENT_KEY) {
      logger.error(`schk API:POST: Missing CLIENT_KEY in request body`);
      return res.status(400).json({ status: 'error' });
    }

    if (CLIENT_KEY === schkKey) {
      // Create encrypted cookie with TTL
      const data = {
        ip,
        expiresAt: Date.now() + TTL_DURATION,
        key: CLIENT_KEY
      };

      const encryptedCookie = encryptCookie(data, cookieKey);

      // Remove HttpOnly; to allow JavaScript access - before Path=/
      res.setHeader('Set-Cookie', `schk=${JSON.stringify(encryptedCookie)}; Path=/; Max-Age=${TTL_DURATION / 1000}; Secure; SameSite=Strict`);
      logger.debug(`schk API:: Set-Cookie: ${JSON.stringify(encryptedCookie)}`);
      return res.status(200).json({ status: 'ok' });
    } else {
      logger.debug(`schk API:PUT: key mismatch`);
      return res.status(400).json({ status: 'error' });
    }
  } else if (req.method === 'GET') {
    // Mode 2: Check existing TTL
    if (!checkRateLimit(ip,)) {
      logger.error(`schk API:GET: Rate limit exceeded for IP: ${ip}`);
      return res.status(400).json({ status: 'error' });
    }

    const cookieKey = process.env.COOKIE_KEY;

    if (!cookieKey) {
      logger.error(`schk API:GET: Missing auth in environment`);
      return res.status(500).json({ status: 'error' });
    }

    if (!req.headers.cookie) {
      logger.warn(`schk API:GET: Missing cookie in request`);
      return res.status(500).json({ status: 'refresh' });
    }
    const cookieValue = req.headers.cookie?.split(';')
      .find(c => c.trim().startsWith('schk='))
      ?.split('=')[1];

    if (!cookieValue) {
      logger.warn (`schk API:GET: No GET cookie found`);
      return res.status(400).json({ status: 'refresh' });
    }

    try {
      const encryptedData = JSON.parse(cookieValue);
      const decryptedData = decryptCookie(encryptedData, cookieKey);

      if (!decryptedData || decryptedData.ip !== ip) {
        logger.debug (`schk API:GET: no decrypted data or IP mismatch`);
        return res.status(400).json({ status: 'error' });
      }

      if (Date.now() > decryptedData.expiresAt) {
        logger.debug (`schk API:GET: TTL expired`);
        return res.status(200).json({ status: 'refresh' });
      }

      logger.debug (`schk API:GET: TTL valid`);
      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error(`schk API:GET: severe error ${error.message}`);
      return res.status(500).json({ status: 'error' });
    }
  } else {
    if (!checkRateLimit(ip, )) {
      logger.error(`schk API:OTHER: Rate limit exceeded for IP: ${ip}`);
      return res.status(400).json({ status: 'error' });
    }
    res.setHeader('Allow', ['GET', 'POST']);
    logger.debug (`schk API:: Invalid method: ${req.method}`);
    return res.status(405).json({ status: 'error' });
  }
}
