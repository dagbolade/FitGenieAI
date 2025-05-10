// frontend/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="bg-white text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-2">FG</div>
            <span className="text-2xl font-bold">FitGenieAI</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/" className={location.pathname === '/' ? 'font-medium' : 'hover:text-blue-200'}>
              Home
            </Link>
            <Link to="/workouts" className={location.pathname === '/workouts' ? 'font-medium' : 'hover:text-blue-200'}>
              Workouts
            </Link>
            <Link to="/exercises" className={location.pathname === '/exercises' ? 'font-medium' : 'hover:text-blue-200'}>
              Exercise Library
            </Link>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'font-medium' : 'hover:text-blue-200'}>
              Dashboard
            </Link>
            <Link
                to="/ai-coach"
                className={location.pathname === '/ai-coach' ? 'font-medium' : 'hover:text-blue-200'}
              >
                AI Coach
            </Link>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-1 rounded-lg font-medium">
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link to="/" className={location.pathname === '/' ? 'font-medium' : ''}>
                Home
              </Link>
              <Link to="/workouts" className={location.pathname === '/workouts' ? 'font-medium' : ''}>
                Workouts
              </Link>
              <Link to="/exercises" className={location.pathname === '/exercises' ? 'font-medium' : ''}>
                Exercise Library
              </Link>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'font-medium' : ''}>
                Dashboard
              </Link>
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium w-full text-left">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}