import api from './api'

export const userService = {
  // Get all users (with optional search)
  getUsers: async (search = '') => {
    const params = search ? { search } : {}
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get a specific user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },
}

