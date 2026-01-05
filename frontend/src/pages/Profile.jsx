import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'

function Profile() {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await authService.getMe()
      setUser(response.data.user)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading profile...</p>
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
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back
              </Link>
              <h1 className="text-2xl font-bold text-primary-600">
                <i className="fas fa-user mr-2"></i>Profile
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/chat"
                className="btn-primary text-sm"
              >
                <i className="fas fa-comments mr-2"></i>Messages
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="flex items-center space-x-6 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary-200 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-3xl">
                {(user?.alias || user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.alias || user?.name}
              </h2>
              {user?.alias && (
                <p className="text-gray-600">{user?.name}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
              <p className="text-lg text-gray-900">{user?.name}</p>
            </div>

            {user?.alias && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Username (Alias)</h3>
                <p className="text-lg text-gray-900">{user?.alias}</p>
                <p className="text-xs text-gray-500 mt-1">
                  This is how others will see you in the community
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>

            {user?.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">What keeps you going?</h3>
                <p className="text-lg text-gray-900">{user?.bio}</p>
              </div>
            )}

            {user?.profile && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Illness Tags</h3>
                {user.profile.illnessTags && user.profile.illnessTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.profile.illnessTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No tags added yet</p>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Member since {new Date(user?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile

