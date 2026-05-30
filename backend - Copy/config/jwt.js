const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'change-me-access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || `${ACCESS_TOKEN_SECRET}-refresh`;
const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL || '30d';

module.exports = {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
};
