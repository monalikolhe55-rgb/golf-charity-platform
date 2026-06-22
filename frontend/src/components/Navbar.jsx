// The navigation bar shown at the top of every page.
// It shows different links depending on whether the user is logged in, and as which role.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
          ⛳ GolfCharity
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <Link to="/charities" className="hover:text-primary-600">Charities</Link>
          <Link to="/draw-results" className="hover:text-primary-600">Draw Results</Link>

          {isLoggedIn && !isAdmin && (
            <>
              <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
              <Link to="/subscription" className="hover:text-primary-600">Subscription</Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" className="hover:text-primary-600">Admin Panel</Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-500">Hi, {user?.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-primary-600">Login</Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
