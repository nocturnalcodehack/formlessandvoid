import logger from "src/utils/logger";
import crypto from "crypto";
import getClientIP from 'src/utils/getClientIP';

const cookieKey = process.env.COOKIE_KEY;

function decryptCookie(encryptedData, key) {
  try {
    const algorithm = 'aes-256-cbc';
    const keyBuffer = crypto.scryptSync(key, 'salt', 32); // Derive proper 32-byte key
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    logger.error('Cookie decryption failed:', error);
    return null;
  }
}

export const adminAPIAuth = (handler) => {
  return async (req, res) => {
    const ip = getClientIP(req);

    logger.debug(`withAdminAPIAuth processing request from IP: ${ip}, Pass-thru Method: ${req.method}`);

    const cookieValue = req.headers.cookie?.split(';')
      .find(c => c.trim().startsWith('schk='))
      ?.split('=')[1];

    if (!cookieValue) {
      logger.error(`API Auth: No TTL cookie found from IP: ${ip}`);
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    try {
      const encryptedData = JSON.parse(decodeURIComponent(cookieValue));
      const decryptedData = decryptCookie(encryptedData, cookieKey);

      if (!decryptedData || decryptedData.ip !== ip) {
        logger.warn(`API Auth: Invalid cookie data or IP mismatch from IP: ${ip}`);
        return res.status(401).json({ status: 'error', message: 'Invalid authentication' });
      }

      if (Date.now() > decryptedData.expiresAt) {
        logger.info(`API Auth: TTL expired for IP: ${ip}`);
        return res.status(401).json({ status: 'refresh', message: 'Session expired' });
      }

      logger.debug(`API Auth: Valid authentication for IP: ${ip}`);

      // Authentication successful - call the actual handler
      return handler(req, res);

    } catch (error) {
      logger.error(`API Auth: Cookie parsing failed from IP: ${ip}:`, error);
      return res.status(401).json({ status: 'error', message: 'Invalid authentication data' });
    }
  }
}
