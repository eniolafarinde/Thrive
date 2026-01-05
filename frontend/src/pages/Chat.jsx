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
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showUserSuggestions, setShowUserSuggestions] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
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

  // Real-time search as user types (with debounce)
  useEffect(() => {
    if (!showUserList) return

    const timeoutId = setTimeout(() => {
      loadUsers(searchTerm)
    }, 300) // Debounce: wait 300ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [searchTerm, showUserList])

  // iMessage-style: Search users as they type in message input when no conversation selected
  useEffect(() => {
    if (selectedUser) {
      setShowUserSuggestions(false)
      setSuggestedUsers([])
      return
    }

    const searchText = messageInput.trim()
    if (searchText.length === 0) {
      setShowUserSuggestions(false)
      setSuggestedUsers([])
      return
    }

    // If it looks like a username/email search, show suggestions
    const timeoutId = setTimeout(async () => {
      try {
        const response = await userService.getUsers(searchText)
        setSuggestedUsers(response.data.users.slice(0, 5)) // Limit to 5 suggestions
        setShowUserSuggestions(true)
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [messageInput, selectedUser])

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

  const handleSelectSuggestedUser = async (user) => {
    setSelectedUser(user)
    setMessageInput('')
    setShowUserSuggestions(false)
    setSuggestedUsers([])
    // Load messages with this user (will be empty if new conversation)
    await loadMessages(user.id)
    // Focus the message input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    // If no user selected but there's input, check if we should select a user first
    if (!selectedUser && messageInput.trim()) {
      const trimmed = messageInput.trim()
      // Check if input matches a user exactly or is an email
      const matchingUser = suggestedUsers.find(
        (u) =>
          u.email.toLowerCase() === trimmed.toLowerCase() ||
          (u.alias && u.alias.toLowerCase() === trimmed.toLowerCase()) ||
          u.name.toLowerCase() === trimmed.toLowerCase()
      )
      
      if (matchingUser) {
        await handleSelectSuggestedUser(matchingUser)
        return
      }
    }

    if (!messageInput.trim() || !selectedUser) return

    const content = messageInput.trim()
    setMessageInput('')
    setSending(true)

    try {
      await messageService.sendMessage(selectedUser.id, content)
      // Reload messages to show the new one
      await loadMessages(selectedUser.id)
      // Reload conversations to update last message
      await loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      setMessageInput(content) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setMessageInput(value)
    // If user clears input while in a conversation, keep the conversation open
    if (value === '' && selectedUser) {
      // Keep conversation open
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
              <h1 className="text-2xl font-bold text-primary-600">
                <i className="fas fa-comments mr-2"></i>Messages
              </h1>
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
              <div className="mb-3">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-300 outline-none transition-all text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        loadUsers('')
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 px-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Search by username (alias), name, or email address
                </p>
              </div>
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
                <i className="fas fa-user-slash text-3xl mb-3 text-gray-300"></i>
                <p className="text-sm font-medium">No users found</p>
                <p className="text-xs mt-1">
                  {searchTerm ? 'Try searching by username, name, or email' : 'Search for users to start a conversation'}
                </p>
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
                        <div className="h-12 w-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-semibold text-lg">
                            {(user.alias || user.name).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.alias || user.name}
                            </p>
                            {user.alias && (
                              <span className="text-xs text-gray-400">({user.name})</span>
                            )}
                          </div>
                          {user.email && (
                            <p className="text-xs text-primary-600 truncate mt-1">
                              <i className="fas fa-envelope mr-1"></i>
                              {user.email}
                            </p>
                          )}
                          {user.bio && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                <p className="text-lg mb-2 font-medium">No conversations yet</p>
                <p className="text-sm mb-4">Click "+ New" to find users and start chatting!</p>
                <button
                  onClick={() => {
                    setShowUserList(true)
                    loadUsers()
                  }}
                  className="btn-primary text-sm"
                >
                  <i className="fas fa-user-plus mr-2"></i>Find Users
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
        <div className="flex-1 flex flex-col bg-white relative">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-100 bg-primary-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.alias || selectedUser.name}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null)
                      setMessages([])
                      setMessageInput('')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <i className="fas fa-comments text-4xl mb-2"></i>
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
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
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-comments text-5xl mb-4 text-gray-300"></i>
                <p className="text-xl mb-2 font-medium text-gray-600">New Message</p>
                <p className="text-sm">Type a username or email to start a conversation</p>
              </div>
            </div>
          )}

          {/* User Suggestions Dropdown */}
          {showUserSuggestions && suggestedUsers.length > 0 && !selectedUser && (
            <div className="absolute bottom-20 left-4 right-4 bg-white border border-purple-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {suggestedUsers.map((suggestedUser) => (
                <button
                  key={suggestedUser.id}
                  onClick={() => handleSelectSuggestedUser(suggestedUser)}
                  className="w-full p-3 text-left hover:bg-primary-50 transition-colors border-b border-purple-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-semibold">
                        {(suggestedUser.alias || suggestedUser.name).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {suggestedUser.alias || suggestedUser.name}
                      </p>
                      {suggestedUser.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {suggestedUser.email}
                        </p>
                      )}
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message Input (Always visible, like iMessage) */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-purple-100 bg-primary-50"
          >
            <div className="flex space-x-2 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder={
                  selectedUser
                    ? 'Type a message...'
                    : 'Enter username or email to start a conversation...'
                }
                className="flex-1 input-field"
                disabled={sending}
              />
              {selectedUser && (
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="btn-primary px-6"
                >
                  {sending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              )}
            </div>
            {!selectedUser && messageInput && suggestedUsers.length === 0 && (
              <p className="text-xs text-gray-500 mt-2 px-2">
                <i className="fas fa-info-circle mr-1"></i>
                No user found. Try a different username or email.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat

