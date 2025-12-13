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

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    setUser(null);

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
    ...styles.nav,
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
    transform: scrolled ? 'translateY(0)' : 'translateY(0)',
  };

  return (
    <>
      {/* Add CSS animations */}
      <style>{navbarAnimations}</style>

      <nav style={navStyle} className="epic-navbar">
        <div style={styles.container}>
          {/* Epic Logo */}
          <Link to="/" style={styles.logo} className="epic-logo">
            <div
              style={{
                ...styles.logoIcon,
                background: (user && darkMode)
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              }}
              className="logo-icon-wrapper"
            >
              <Plane size={24} strokeWidth={2.5} className="logo-plane-icon" />
            </div>
            <div style={styles.logoText}>
              <span
                style={{
                  ...styles.logoMain,
                  color: '#10b981',
                }}
                className="logo-main-text"
              >
                HoP
              </span>
              <span
                style={{
                  ...styles.logoSub,
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
            style={{
              ...styles.mobileMenuBtn,
              color: (user && darkMode) ? '#fff' : '#1f2937',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links */}
          <div
            style={{
              ...styles.links,
              ...(mobileMenuOpen ? styles.linksMobileOpen : {}),
              background: mobileMenuOpen
                ? (user && darkMode)
                  ? 'rgba(10, 10, 10, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)'
                : 'transparent',
            }}
            className="nav-links-container"
          >
            <Link
              to="/"
              style={{
                ...styles.link,
                ...(isActive('/') ? styles.linkActive : {}),
                color: (user && darkMode) ? '#e5e7eb' : '#1f2937',
              }}
              className={`epic-nav-link ${isActive('/') ? 'active' : ''}`}
              onMouseEnter={() => setHoveredLink('home')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Home size={18} className="nav-icon" />
              <span>Home</span>
              {isActive('/') && <div className="active-indicator"></div>}
            </Link>

            <Link
              to="/hotels"
              style={{
                ...styles.link,
                ...(isActive('/hotels') ? styles.linkActive : {}),
                color: (user && darkMode) ? '#e5e7eb' : '#1f2937',
              }}
              className={`epic-nav-link ${isActive('/hotels') ? 'active' : ''}`}
              onMouseEnter={() => setHoveredLink('hotels')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Hotel size={18} className="nav-icon" />
              <span>Hotels</span>
              {isActive('/hotels') && <div className="active-indicator"></div>}
            </Link>

            <Link
              to="/trips"
              style={{
                ...styles.link,
                ...(isActive('/trips') ? styles.linkActive : {}),
                color: (user && darkMode) ? '#e5e7eb' : '#1f2937',
              }}
              className={`epic-nav-link ${isActive('/trips') ? 'active' : ''}`}
              onMouseEnter={() => setHoveredLink('trips')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Plane size={18} className="nav-icon" />
              <span>Trips</span>
              {isActive('/trips') && <div className="active-indicator"></div>}
            </Link>

            {user && (
              <>
                <Link
                  to="/bookings"
                  style={{
                    ...styles.link,
                    ...(isActive('/bookings') ? styles.linkActive : {}),
                    color: (user && darkMode) ? '#e5e7eb' : '#1f2937',
                  }}
                  className={`epic-nav-link ${isActive('/bookings') ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredLink('bookings')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <CreditCard size={18} className="nav-icon" />
                  <span>My Bookings</span>
                  {isActive('/bookings') && <div className="active-indicator"></div>}
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    style={{
                      ...styles.link,
                      ...(isActive('/admin') ? styles.linkActive : {}),
                      color: (user && darkMode) ? '#e5e7eb' : '#1f2937',
                    }}
                    className={`epic-nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredLink('admin')}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <Shield size={18} className="nav-icon" />
                    <span>Admin</span>
                    {isActive('/admin') && <div className="active-indicator"></div>}
                  </Link>
                )}
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/account"
                  style={{
                    ...styles.link,
                    ...(isActive('/account') ? styles.linkActive : {}),
                    color: darkMode ? '#e5e7eb' : '#1f2937',
                  }}
                  className={`epic-nav-link ${isActive('/account') ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredLink('account')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      style={styles.profileImage}
                      className="profile-image"
                    />
                  ) : (
                    <User size={18} className="nav-icon" />
                  )}
                  <span>{user.name}</span>
                  {isActive('/account') && <div className="active-indicator"></div>}
                </Link>

                <TierBadge userId={user.id} />

                <button
                  onClick={toggleDarkMode}
                  style={{
                    ...styles.darkModeBtn,
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  }}
                  className="epic-dark-mode-btn"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun size={18} className="theme-icon" /> : <Moon size={18} className="theme-icon" />}
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    ...styles.logoutButton,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  }}
                  className="epic-logout-btn"
                >
                  <LogOut size={18} className="nav-icon" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={styles.loginButton}
                className="epic-login-btn"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
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

  .epic-nav-link::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0%;
    height: 2px;
    background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
  }

  .epic-nav-link:hover::before {
    width: 80%;
  }

  .epic-nav-link.active::before {
    width: 100%;
    height: 3px;
  }

  .epic-nav-link:hover {
    transform: translateY(-2px);
  }

  .epic-nav-link.active {
    font-weight: 700;
  }

  .nav-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-nav-link:hover .nav-icon {
    transform: scale(1.2) rotate(5deg);
    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
  }

  .epic-nav-link.active .nav-icon {
    color: #10b981;
    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
  }

  .active-indicator {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: translateX(-50%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateX(-50%) scale(1.3);
      opacity: 0.7;
    }
  }

  /* Dark Mode Button */
  .epic-dark-mode-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-dark-mode-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .theme-icon {
    transition: all 0.3s ease;
  }

  .epic-dark-mode-btn:hover .theme-icon {
    transform: rotate(180deg) scale(1.2);
  }

  /* Logout/Login Button */
  .epic-logout-btn, .epic-login-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .epic-logout-btn:hover, .epic-login-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 32px rgba(239, 68, 68, 0.4);
  }

  .epic-login-btn:hover {
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
  }

  /* Mobile Menu Button */
  .mobile-menu-btn {
    transition: all 0.3s ease;
  }

  .mobile-menu-btn:hover {
    transform: rotate(90deg) scale(1.1);
  }

  /* Mobile Menu Animation */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .nav-links-container {
    animation: slideDown 0.3s ease;
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

  .epic-nav-link.active .profile-image {
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.6);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block !important;
    }

    .nav-links-container {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      padding: 2rem;
      gap: 1rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .nav-links-container[style*="background"] {
      display: flex !important;
    }

    .epic-nav-link::before {
      bottom: 0;
      left: 0;
      transform: none;
      height: 100%;
      border-radius: 8px;
      opacity: 0.1;
    }

    .epic-nav-link:hover::before {
      width: 100%;
    }
  }
`;

const styles = {
  nav: {
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
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
    fontSize: '1.5rem',
    fontWeight: '800',
    lineHeight: 1,
  },
  logoSub: {
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginTop: '2px',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  linksMobileOpen: {},
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  linkActive: {
    background: 'rgba(16, 185, 129, 0.1)',
  },
  darkModeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    cursor: 'pointer',
  },
  profileImage: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #10b981',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    objectFit: 'cover',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default Navbar;
