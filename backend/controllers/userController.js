const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../config/store');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} = require('../config/jwt');

const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Server error' : error.message;
  return res.status(statusCode).json({ success: false, message });
};

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

function issueTokenPair(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

  return {
    accessToken,
    refreshToken,
  };
}

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await store.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await store.createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
    });

    const tokens = issueTokenPair(user);

    res.status(201).json({
      success: true,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, error);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await store.getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const tokens = issueTokenPair(user);

    res.json({
      success: true,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, error);
  }
};

// Refresh access token
const refresh = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.header('x-refresh-token');
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await store.getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tokens = issueTokenPair(user);

    res.json({
      success: true,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Get current user profile
const me = async (req, res) => {
  try {
    const user = await store.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile error:', error);
    sendError(res, error);
  }
};

// Get user reservations
const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await store.getUserReservations(userId);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch user reservations error:', error);
    sendError(res, error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  me,
  getUserReservations,
};
