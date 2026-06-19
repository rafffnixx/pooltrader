import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ============================================
  // 🔧 LOGO SIZE SETTINGS - Adjust these values
  // ============================================
  // Small:   w-10 h-10 (40px)
  // Medium:  w-12 h-12 (48px) ← DEFAULT
  // Large:   w-14 h-14 (56px)
  // XL:      w-16 h-16 (64px)
  // Custom:  w-20 h-20 (80px)
  // ============================================
  const LOGO_SIZE = 'w-14 h-14'; // ← Change this!
  const LOGO_RADIUS = 'rounded-xl'; // rounded-xl, rounded-2xl, rounded-full
  const LOGO_SHADOW = 'shadow-[0_0_20px_rgba(0,212,170,0.15)]';
  const LOGO_SHADOW_HOVER = 'group-hover:shadow-[0_0_40px_rgba(0,212,170,0.3)]';

  return (
    <nav className="bg-[#111618] border-b border-[#2a3538] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo with Custom Image */}
          <Link to="/" className="flex items-center space-x-3 no-underline group">
            <div className={`${LOGO_SIZE} ${LOGO_RADIUS} overflow-hidden flex items-center justify-center ${LOGO_SHADOW} ${LOGO_SHADOW_HOVER} transition-all duration-500`}>
              <img 
                src="/pooltrader.png" 
                alt="PoolTrader Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-xl md:text-2xl text-[#e8f0f0] tracking-tight">
              Pool<span className="text-[#00d4aa]">Trader</span>
            </span>
          </Link>

          {/* Desktop Menu - Rest of your navbar code */}
          <div className="hidden lg:flex items-center space-x-1">
            {!isAuthenticated && (
              <Link 
                to="/" 
                className={`nav-link font-semibold ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
            )}
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link font-semibold ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/history" 
                  className={`nav-link font-semibold ${isActive('/history') ? 'active' : ''}`}
                >
                  History
                </Link>
                <Link 
                  to="/wallet" 
                  className={`nav-link font-semibold ${isActive('/wallet') ? 'active' : ''}`}
                >
                  Wallet
                </Link>
                
                {user?.isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`nav-link font-semibold text-[#00d4aa] hover:text-[#33ddbb] ${
                      isActive('/admin') ? 'active text-[#00d4aa]' : ''
                    }`}
                  >
                    ⚡ Admin
                  </Link>
                )}
              </>
            )}

            <Link 
              to="/about" 
              className={`nav-link font-semibold ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link font-semibold ${isActive('/contact') ? 'active' : ''}`}
            >
              Contact
            </Link>
            <Link 
              to="/faq" 
              className={`nav-link font-semibold ${isActive('/faq') ? 'active' : ''}`}
            >
              FAQ
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-[#a0b4b8] hidden md:inline">
                  👋 <span className="text-[#e8f0f0]">{user?.fullName?.split(' ')[0] || 'Trader'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm font-semibold"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#a0b4b8] hover:text-[#e8f0f0] hover:bg-[#1c2426] transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-[#2a3538]">
            <div className="flex flex-col space-y-1">
              {!isAuthenticated && (
                <Link 
                  to="/" 
                  className={`mobile-nav-link font-semibold ${isActive('/') ? 'active' : ''}`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🏠 Home
                </Link>
              )}
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`mobile-nav-link font-semibold ${isActive('/dashboard') ? 'active' : ''}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link 
                    to="/history" 
                    className={`mobile-nav-link font-semibold ${isActive('/history') ? 'active' : ''}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📈 History
                  </Link>
                  <Link 
                    to="/wallet" 
                    className={`mobile-nav-link font-semibold ${isActive('/wallet') ? 'active' : ''}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    💰 Wallet
                  </Link>
                  {user?.isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`mobile-nav-link font-semibold text-[#00d4aa] ${
                        isActive('/admin') ? 'active text-[#00d4aa]' : ''
                      }`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ⚡ Admin Panel
                    </Link>
                  )}
                </>
              )}
              
              <Link 
                to="/about" 
                className={`mobile-nav-link font-semibold ${isActive('/about') ? 'active' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ℹ️ About
              </Link>
              <Link 
                to="/contact" 
                className={`mobile-nav-link font-semibold ${isActive('/contact') ? 'active' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📧 Contact
              </Link>
              <Link 
                to="/faq" 
                className={`mobile-nav-link font-semibold ${isActive('/faq') ? 'active' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ❓ FAQ
              </Link>
              
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-3 border-t border-[#2a3538] mt-2">
                  <Link 
                    to="/login" 
                    className="btn btn-secondary w-full text-center font-semibold" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary w-full text-center font-semibold" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Now
                  </Link>
                </div>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="btn btn-danger w-full text-center font-semibold mt-2"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;