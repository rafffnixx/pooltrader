import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="font-bold text-xl dark:text-white">PoolTrader</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">Home</Link>

            
            
            
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">Dashboard</Link>
                <Link to="/pools/active" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">Active Pool</Link>
                <Link to="/history" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">History</Link>
                <Link to="/wallet" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">Wallet</Link>
                {/* Add these links in the desktop menu section */}


{user?.isAdmin && (
  <>
    <Link to="/admin" className="text-purple-600 hover:text-purple-700 transition font-semibold">
      ⚡ Admin Panel
    </Link>
    <Link to="/customers" className="text-blue-600 hover:text-blue-700 transition font-semibold">
      👥 Customers
    </Link>
  </>
)}
              </>
            )}


            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">Contact</Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">About</Link>
            <Link to="/faq" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">FAQ</Link>

            
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user?.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="px-2 py-1 hover:text-blue-600">Home</Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="px-2 py-1 hover:text-blue-600">Dashboard</Link>
                  <Link to="/pools/active" className="px-2 py-1 hover:text-blue-600">Active Pool</Link>
                  <Link to="/history" className="px-2 py-1 hover:text-blue-600">History</Link>
                  {user?.isAdmin && (
                    <Link to="/admin" className="px-2 py-1 text-purple-600 hover:text-purple-700">⚡ Admin Panel</Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;