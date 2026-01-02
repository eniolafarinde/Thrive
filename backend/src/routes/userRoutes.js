const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getUsers, getUserById } = require('../controllers/userController');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getUsers);
router.get('/:userId', getUserById);

module.exports = router;

