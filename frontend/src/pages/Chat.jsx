import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { messageService } from '../services/messageService'
import { userService } from '../services/userService'

function Chat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const messagesEndRef = useRef(null)
  const [pollingInterval, setPollingInterval] = useState(null)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id)
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedUser.id)
      }, 3000)

      setPollingInterval(interval)

      return () => {
        clearInterval(interval)
      }
    }
  }, [selectedUser])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await messageService.getConversations()
      setConversations(response.data.conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (search = '') => {
    try {
      setLoadingUsers(true)
      const response = await userService.getUsers(search)
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleStartConversation = async (otherUser) => {
    setSelectedUser(otherUser)
    setShowUserList(false)
    setSearchTerm('')
    // Load messages with this user
    await loadMessages(otherUser.id)
  }

  const handleSearchUsers = async (e) => {
    e.preventDefault()
    await loadUsers(searchTerm)
  }

  const loadMessages = async (otherUserId) => {
    try {
      const response = await messageService.getMessages(otherUserId)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSelectUser = (conversation) => {
    setSelectedUser(conversation.user)
    setMessages([])
    setShowUserList(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      await messageService.sendMessage(selectedUser.id, content)
      // Reload messages to show the new one
      await loadMessages(selectedUser.id)
      // Reload conversations to update last message
      await loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(content) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100">
      <nav className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-primary-600">💬 Messages</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">{user?.alias || user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-purple-200 bg-white overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => {
                  setShowUserList(!showUserList)
                  if (!showUserList) {
                    loadUsers()
                  }
                }}
                className="btn-primary text-sm px-3 py-1"
              >
                {showUserList ? '← Back' : '+ New'}
              </button>
            </div>
            {showUserList && (
              <form onSubmit={handleSearchUsers} className="mb-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="flex-1 input-field text-sm"
                  />
                  <button type="submit" className="btn-primary text-sm px-3 py-1">
                    Search
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {showUserList ? (
              loadingUsers ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No users found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="divide-y divide-purple-100">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartConversation(user)}
                      className="w-full p-4 text-left hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                          <span className="text-primary-700 font-semibold">
                            {(user.alias || user.name).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.alias || user.name}
                          </p>
                          {user.bio && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-2">No conversations yet</p>
                <p className="text-sm mb-4">Click "+ New" to find users and start chatting!</p>
                <button
                  onClick={() => {
                    setShowUserList(true)
                    loadUsers()
                  }}
                  className="btn-primary text-sm"
                >
                  Find Users
                </button>
              </div>
            ) : (
              <div className="divide-y divide-purple-100">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => handleSelectUser(conversation)}
                    className={`w-full p-4 text-left hover:bg-primary-50 transition-colors ${
                      selectedUser?.id === conversation.user.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900 truncate">
                            {conversation.user.alias || conversation.user.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-100 bg-primary-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.alias || selectedUser.name}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender.id === user.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-purple-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-purple-100 bg-primary-50"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 input-field"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary px-6"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat

