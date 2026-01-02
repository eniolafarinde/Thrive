const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
} = require('../controllers/messageController');

// All routes require authentication
router.use(authenticate);

// Routes (order matters - specific routes before dynamic ones)
router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.patch('/:messageId/read', markAsRead);
router.get('/:otherUserId', getMessages);

module.exports = router;

