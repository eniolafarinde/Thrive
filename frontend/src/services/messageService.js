import api from './api'

export const messageService = {
  // Send a message
  sendMessage: async (recipientId, content) => {
    const response = await api.post('/messages', {
      recipientId,
      content,
    })
    return response.data
  },

  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/messages/conversations')
    return response.data
  },

  // Get messages with a specific user
  getMessages: async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`)
    return response.data
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await api.patch(`/messages/${messageId}/read`)
    return response.data
  },
}

