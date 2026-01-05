import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                <i className="fas fa-seedling mr-2"></i>Thrive
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/chat"
                className="btn-primary text-sm"
              >
                <i className="fas fa-comments mr-2"></i>Messages
              </Link>
              <Link
                to="/profile"
                className="btn-secondary text-sm"
              >
                <i className="fas fa-user mr-2"></i>Profile
              </Link>
              <span className="text-gray-700">
                Welcome, {user?.alias || user?.name}!
              </span>
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

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Thrive
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A compassionate community for reconnecting with purpose, strength,
            and belonging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-4xl mb-4 text-primary-600">
              <i className="fas fa-heart"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Community & Connection</h3>
            <p className="text-gray-600">
              Connect with others who understand your journey. Share your story
              and find support.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4 text-primary-600">
              <i className="fas fa-comments"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chat & Support</h3>
            <p className="text-gray-600">
              Join support circles and have meaningful conversations with others
              who care.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4 text-primary-600">
              <i className="fas fa-sun"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Daily Encouragement</h3>
            <p className="text-gray-600">
              Receive gentle daily reminders and affirmations tailored to your
              needs.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4 text-primary-600">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Reminders</h3>
            <p className="text-gray-600">
              Never miss important medications or appointments with helpful
              reminders.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4 text-primary-600">
              <i className="fas fa-bell"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Stay Connected</h3>
            <p className="text-gray-600">
              Get notified about new messages, comments, and community updates.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4 text-primary-600">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Private</h3>
            <p className="text-gray-600">
              Your privacy and safety are our top priorities. Share only what
              you're comfortable with.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home

