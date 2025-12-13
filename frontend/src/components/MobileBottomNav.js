import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Calendar } from 'lucide-react';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/hotels', icon: Search, label: 'Search' },
    { path: '/wishlist', icon: Heart, label: 'Saved' },
    { path: '/bookings', icon: Calendar, label: 'Trips' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={active ? styles.navItemActive : styles.navItem}
            className="mobile-nav-btn"
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span style={active ? styles.labelActive : styles.label}>
              {item.label}
            </span>
            {active && <div style={styles.activeDot} />}
          </button>
        );
      })}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: 'white',
    borderTop: '1px solid #e5e7eb',
    display: 'none', // Hidden by default, shown on mobile
    zIndex: 1000,
    boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    padding: '0.5rem',
  },
  navItemActive: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    background: '#f0fdf4',
    border: 'none',
    color: '#10b981',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    padding: '0.5rem',
  },
  label: {
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  labelActive: {
    fontSize: '0.7rem',
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    top: '8px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#10b981',
  },
};

// Global styles - show on mobile only
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      nav[style*="position: fixed"][style*="bottom: 0"] {
        display: flex !important;
      }

      /* Add padding to body to account for bottom nav */
      body {
        padding-bottom: 70px;
      }
    }

    .mobile-nav-btn:active {
      transform: scale(0.95);
    }

    @media (min-width: 769px) {
      nav[style*="position: fixed"][style*="bottom: 0"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default MobileBottomNav;
