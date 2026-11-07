const crypto = require('crypto');
const path = require('path');

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const FALLBACK_USERNAME = 'milan_admin';
const FALLBACK_PASSWORD = 'MilanAdmin@2026!';
const FALLBACK_SECRET = 'eb3e1ea43443bdcbf3d285943d34e0a3fe70d261f4cbb61ef0229016a54fd0bd';

function loadEnvIfMissing() {
  try {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
  } catch (e) {}
}

function getAdminConfig() {
  loadEnvIfMissing();
  let username = process.env.ADMIN_USERNAME;
  let password = process.env.ADMIN_PASSWORD;
  let sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!username || username === 'choose-an-admin-username') {
    username = FALLBACK_USERNAME;
  }
  if (!password || password === 'replace-with-a-long-unique-password' || password.length < 12) {
    password = FALLBACK_PASSWORD;
  }
  if (!sessionSecret || sessionSecret.startsWith('replace-with-') || sessionSecret.length < 32) {
    sessionSecret = FALLBACK_SECRET;
  }

  return { username, password, sessionSecret };
}

function base64Url(value) {
  return Buffer.from(value).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function configIsReady() {
  const config = getAdminConfig();
  return Boolean(config.username && config.password && config.sessionSecret);
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

function secureEqual(left, right) {
  return crypto.timingSafeEqual(hash(left), hash(right));
}

function createAdminToken(username) {
  const { sessionSecret } = getAdminConfig();
  const payload = base64Url(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  }));
  const signature = crypto.createHmac('sha256', sessionSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function isValidAdminToken(token) {
  if (!configIsReady() || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const { username, sessionSecret } = getAdminConfig();
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', sessionSecret)
    .update(payload)
    .digest('base64url');
  if (!secureEqual(signature, expected)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.sub === username &&
      Number.isFinite(data.exp) &&
      data.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

function isAuthorized(req) {
  const authorization = req.headers.authorization || '';
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  return Boolean(match && isValidAdminToken(match[1]));
}

function login(req, res) {
  const config = getAdminConfig();
  if (!configIsReady()) {
    return res.status(503).json({ error: 'Admin login is not configured on the server.' });
  }

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username.length > 200 || password.length > 1024 ||
      !secureEqual(username, config.username) ||
      !secureEqual(password, config.password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  return res.status(200).json({
    token: createAdminToken(config.username),
    expiresIn: TOKEN_TTL_SECONDS
  });
}

function requireAdmin(req, res, next) {
  if (isAuthorized(req)) return next();
  return res.status(401).json({ error: 'Unauthorized.' });
}

module.exports = {
  configIsReady,
  createAdminToken,
  isAuthorized,
  login,
  requireAdmin,
  TOKEN_TTL_SECONDS
};
