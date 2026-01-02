const prisma = require('../config/database');

/**
 * Send a message to another user
 */
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.userId;

    // Validation
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and content are required',
      });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    // Prevent users from messaging themselves
    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself',
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            alias: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            alias: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all unique users the current user has messaged or received messages from
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { recipientId: true },
      distinct: ['recipientId'],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { recipientId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const allUserIds = [
      ...new Set([
        ...sentMessages.map((m) => m.recipientId),
        ...receivedMessages.map((m) => m.senderId),
      ]),
    ];

    // Get the latest message for each conversation
    const conversations = await Promise.all(
      allUserIds.map(async (otherUserId) => {
        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: otherUserId },
              { senderId: otherUserId, recipientId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                alias: true,
              },
            },
          },
        });

        // Get the other user's info
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            alias: true,
          },
        });

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            recipientId: userId,
            isRead: false,
          },
        });

        return {
          user: otherUser,
          lastMessage: latestMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get messages between current user and another user
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    // Validate other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        alias: true,
      },
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            alias: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: { messages, otherUser },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Mark messages as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only recipient can mark as read
    if (message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own received messages as read',
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: { message: updatedMessage },
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
};

