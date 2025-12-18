import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plane, Hotel, CreditCard, Home, User, LogIn, LogOut, Shield, Menu, X, Moon, Sun, Sparkles } from 'lucide-react';
import { authService } from '../services/api';
import TierBadge from './TierBadge';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Only apply dark mode if user is authenticated
    if (currentUser) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setDarkMode(userData.darkMode || false);
    } else {
      // Force light mode for non-authenticated users
      setDarkMode(false);
    }
  }, [location]);

  // Handle resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Listen for profileImage changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = authService.getCurrentUser();
      if (updatedUser && updatedUser.profileImage !== user?.profileImage) {
        setUser(updatedUser);
      }
    };

    // Listen for custom storage event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileImageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageUpdated', handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Only apply dark mode if user is authenticated
    if (user && darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode, user]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setMobileMenuOpen(false);

    // Force light mode on logout
    setDarkMode(false);
    document.body.classList.remove('dark-mode');

    navigate('/login');
  };

  const toggleDarkMode = () => {
    // Only allow dark mode toggle if user is authenticated
    if (!user) {
      return;
    }

    const newMode = !darkMode;

    // Save to localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.darkMode = newMode;
    localStorage.setItem('user', JSON.stringify(userData));

    // Apply dark mode class
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Force page reload to ensure all components update correctly
    window.location.reload();
  };

  const navStyle = {
    padding: isMobile ? '0.75rem 0' : '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
    background: (user && darkMode)
      ? scrolled
        ? 'rgba(10, 10, 10, 0.95)'
        : 'rgba(10, 10, 10, 0.8)'
      : scrolled
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    boxShadow: scrolled
      ? (user && darkMode)
        ? '0 8px 32px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)'
        : '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.1)'
      : (user && darkMode)
      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
      : '0 4px 16px rgba(0, 0, 0, 0.04)',
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isMobile ? '0 1rem' : '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  };

  const mobileMenuBtnStyle = {
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: (user && darkMode) ? '#fff' : '#1f2937',
    zIndex: 1001,
  };

  const linksContainerStyle = {
    display: isMobile ? (mobileMenuOpen ? 'flex' : 'none') : 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? '0.5rem' : '0.5rem',
    position: isMobile ? 'fixed' : 'static',
    top: isMobile ? '0' : 'auto',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? '0' : 'auto',
    bottom: isMobile ? '0' : 'auto',
    background: isMobile
      ? (user && darkMode)
        ? 'rgba(10, 10, 10, 0.98)'
        : 'rgba(255, 255, 255, 0.98)'
      : 'transparent',
    padding: isMobile ? '80px 1.5rem 2rem' : '0',
    backdropFilter: isMobile ? 'blur(20px)' : 'none',
    overflowY: isMobile ? 'auto' : 'visible',
    zIndex: isMobile ? 999 : 'auto',
  };

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: isMobile ? '1rem 1.25rem' : '0.75rem 1.25rem',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: isMobile ? '1.1rem' : '0.95rem',
    borderRadius: '12px',
    cursor: 'pointer',
    color: (user && darkMode) ? '#e5e7eb' : '#1f2937',
    background: isActive(path) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    transition: 'all 0.2s ease',
  });

  const actionButtonsStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? '0.75rem' : '0.5rem',
    marginTop: isMobile ? '1rem' : '0',
    paddingTop: isMobile ? '1rem' : '0',
    borderTop: isMobile ? `1px solid ${(user && darkMode) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none',
  };

  return (
    <>
      {/* Add CSS animations */}
      <style>{navbarAnimations}</style>

      <nav style={navStyle} className="epic-navbar">
        <div style={containerStyle}>
          {/* Epic Logo */}
          <Link to="/" style={styles.logo} className="epic-logo">
            <div
              style={{
                ...styles.logoIcon,
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                background: (user && darkMode)
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              }}
              className="logo-icon-wrapper"
            >
              <Plane size={isMobile ? 20 : 24} strokeWidth={2.5} className="logo-plane-icon" />
            </div>
            <div style={styles.logoText}>
              <span
                style={{
                  ...styles.logoMain,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  color: '#10b981',
                }}
                className="logo-main-text"
              >
                HoP
              </span>
              <span
                style={{
                  ...styles.logoSub,
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  color: (user && darkMode) ? '#9ca3af' : '#6b7280',
                }}
                className="logo-sub-text"
              >
                House of Paradise
              </span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            style={mobileMenuBtnStyle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Navigation Links */}
          <div style={linksContainerStyle} className="nav-links-container">
            {/* Close button for mobile overlay */}
            {isMobile && mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: (user && darkMode) ? '#fff' : '#1f2937',
                  zIndex: 1002,
                }}
              >
                <X size={28} />
              </button>
            )}

            <Link
              to="/"
              style={linkStyle('/')}
              className={`epic-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={20} className="nav-icon" />
              <span>Home</span>
            </Link>

            <Link
              to="/hotels"
              style={linkStyle('/hotels')}
              className={`epic-nav-link ${isActive('/hotels') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Hotel size={20} className="nav-icon" />
              <span>Hotels</span>
            </Link>

            <Link
              to="/trips"
              style={linkStyle('/trips')}
              className={`epic-nav-link ${isActive('/trips') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Plane size={20} className="nav-icon" />
              <span>Trips</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/bookings"
                  style={linkStyle('/bookings')}
                  className={`epic-nav-link ${isActive('/bookings') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CreditCard size={20} className="nav-icon" />
                  <span>My Bookings</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    style={linkStyle('/admin')}
                    className={`epic-nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={20} className="nav-icon" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}

            {/* Action buttons section */}
            <div style={actionButtonsStyle}>
              {user ? (
                <>
                  <Link
                    to="/account"
                    style={{
                      ...linkStyle('/account'),
                      justifyContent: isMobile ? 'flex-start' : 'center',
                    }}
                    className={`epic-nav-link ${isActive('/account') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        style={{
                          ...styles.profileImage,
                          width: isMobile ? '36px' : '32px',
                          height: isMobile ? '36px' : '32px',
                        }}
                        className="profile-image"
                      />
                    ) : (
                      <User size={20} className="nav-icon" />
                    )}
                    <span>{user.name}</span>
                  </Link>

                  {!isMobile && <TierBadge userId={user.id} />}

                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'row',
                    gap: '0.5rem',
                    marginTop: isMobile ? '0.5rem' : '0',
                  }}>
                    <button
                      onClick={toggleDarkMode}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: isMobile ? '0.875rem' : '0.75rem',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        flex: isMobile ? 1 : 'none',
                      }}
                      className="epic-dark-mode-btn"
                      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {darkMode ? <Sun size={20} className="theme-icon" /> : <Moon size={20} className="theme-icon" />}
                      {isMobile && <span style={{ marginLeft: '0.5rem' }}>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: isMobile ? '0.875rem 1.25rem' : '0.75rem 1.25rem',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: isMobile ? '1rem' : '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        flex: isMobile ? 1 : 'none',
                      }}
                      className="epic-logout-btn"
                    >
                      <LogOut size={20} className="nav-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: isMobile ? '1rem 1.5rem' : '0.75rem 1.5rem',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: isMobile ? '1.1rem' : '0.95rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    cursor: 'pointer',
                  }}
                  className="epic-login-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

const navbarAnimations = `
  /* Logo Animations */
  .epic-logo {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-logo:hover {
    transform: translateY(-2px);
  }

  .logo-icon-wrapper {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-logo:hover .logo-icon-wrapper {
    transform: rotate(360deg) scale(1.1);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  }

  .logo-plane-icon {
    animation: planeFly 3s ease-in-out infinite;
  }

  @keyframes planeFly {
    0%, 100% {
      transform: translateX(0) translateY(0);
    }
    50% {
      transform: translateX(2px) translateY(-2px);
    }
  }

  .logo-main-text {
    transition: all 0.3s ease;
  }

  .epic-logo:hover .logo-main-text {
    letter-spacing: 2px;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }

  .logo-sub-text {
    transition: all 0.3s ease;
    opacity: 0.8;
  }

  .epic-logo:hover .logo-sub-text {
    opacity: 1;
  }

  /* Nav Link Animations */
  .epic-nav-link {
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-nav-link:hover {
    background: rgba(16, 185, 129, 0.1) !important;
  }

  .epic-nav-link:active {
    transform: scale(0.98);
  }

  .nav-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-nav-link:hover .nav-icon {
    transform: scale(1.1);
    color: #10b981;
  }

  .epic-nav-link.active .nav-icon {
    color: #10b981;
  }

  /* Dark Mode Button */
  .epic-dark-mode-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-dark-mode-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .epic-dark-mode-btn:active {
    transform: scale(0.95);
  }

  .theme-icon {
    transition: all 0.3s ease;
  }

  .epic-dark-mode-btn:hover .theme-icon {
    transform: rotate(180deg);
  }

  /* Logout/Login Button */
  .epic-logout-btn, .epic-login-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-logout-btn:hover, .epic-login-btn:hover {
    transform: translateY(-2px) scale(1.02);
  }

  .epic-logout-btn:active, .epic-login-btn:active {
    transform: scale(0.98);
  }

  .epic-login-btn:hover {
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
  }

  /* Mobile Menu Button */
  .mobile-menu-btn {
    transition: all 0.3s ease;
  }

  .mobile-menu-btn:active {
    transform: scale(0.9);
  }

  /* Navbar Entrance */
  .epic-navbar {
    animation: navbarSlideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes navbarSlideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Profile Image Animations */
  .profile-image {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-nav-link:hover .profile-image {
    transform: scale(1.1);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
  }

  /* Mobile specific styles */
  @media (max-width: 768px) {
    .nav-links-container {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
`;

const styles = {
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    cursor: 'pointer',
    zIndex: 1001,
  },
  logoIcon: {
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoMain: {
    fontWeight: '800',
    lineHeight: 1,
  },
  logoSub: {
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginTop: '2px',
  },
  profileImage: {
    borderRadius: '50%',
    border: '2px solid #10b981',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    objectFit: 'cover',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default Navbar;
