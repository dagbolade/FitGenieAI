// frontend/src/components/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-white text-blue-600 font-bold rounded p-2 mr-2">FG</div>
              <span className="text-xl font-bold">FitGenieAI</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                to="/"
                className={location.pathname === '/' ? 'font-medium' : 'hover:text-blue-200'}
              >
                Home
              </Link>

              <Link
                to="/workouts"
                className={location.pathname === '/workouts' ? 'font-medium' : 'hover:text-blue-200'}
              >
                Workouts
              </Link>

              <Link
                to="/exercises"
                className={location.pathname.startsWith('/exercise') ? 'font-medium' : 'hover:text-blue-200'}
              >
                Exercise Library
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={location.pathname === '/dashboard' ? 'font-medium' : 'hover:text-blue-200'}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/ai-coach"
                    className={location.pathname === '/ai-coach' ? 'font-medium' : 'hover:text-blue-200'}
                  >
                    AI Coach
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <span className="mr-4 hidden md:inline">Hello, {user?.firstName}</span>
                <button
                  onClick={logout}
                  className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu - shown/hidden with state */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md ${location.pathname === '/' ? 'bg-blue-700 font-medium' : 'hover:bg-blue-700'}`}
          >
            Home
          </Link>

          <Link
            to="/workouts"
            className={`block px-3 py-2 rounded-md ${location.pathname === '/workouts' ? 'bg-blue-700 font-medium' : 'hover:bg-blue-700'}`}
          >
            Workouts
          </Link>

          <Link
            to="/exercises"
            className={`block px-3 py-2 rounded-md ${location.pathname.startsWith('/exercise') ? 'bg-blue-700 font-medium' : 'hover:bg-blue-700'}`}
          >
            Exercise Library
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md ${location.pathname === '/dashboard' ? 'bg-blue-700 font-medium' : 'hover:bg-blue-700'}`}
              >
                Dashboard
              </Link>

              <Link
                to="/ai-coach"
                className={`block px-3 py-2 rounded-md ${location.pathname === '/ai-coach' ? 'bg-blue-700 font-medium' : 'hover:bg-blue-700'}`}
              >
                AI Coach
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;