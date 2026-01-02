const { verifyToken, extractToken } = require('../utils/jwt');
const prisma = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please authenticate.',
      });
    }

    const decoded = verifyToken(token);
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        alias: true,
        bio: true,
        isAnonymous: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          alias: true,
          bio: true,
          isAnonymous: true,
          createdAt: true,
        },
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};

