function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '127.0.0.1';
}

export default getClientIP;
