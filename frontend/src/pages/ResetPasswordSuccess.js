import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

function ResetPasswordSuccess() {
  // Dark mode state - read from localStorage, default to false (light mode)
  const [darkMode] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.darkMode || false;
      } catch {
        return false;
      }
    }
    return false;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // On mount, force remove dark-mode if not set
  useEffect(() => {
    if (!darkMode) {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  useEffect(() => {
    // Optional: Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.card} className="success-card">
        <div style={styles.successIcon}>
          <CheckCircle size={64} />
        </div>

        <h1 style={styles.title}>Password Changed Successfully!</h1>

        <p style={styles.subtitle}>
          Your password has been updated. You can now login with your new password.
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            For security reasons, you've been logged out of all devices. Please login again with your new password.
          </p>
        </div>

        <Link to="/login" style={styles.loginButton} className="login-btn-hover">
          Go to Login Page
          <ArrowRight size={20} />
        </Link>

        <p style={styles.autoRedirect}>
          Automatically redirecting in 10 seconds...
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    zIndex: 0,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3rem',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(16, 185, 129, 0.2)',
    textAlign: 'center',
  },
  successIcon: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    margin: '0 auto 2rem',
    boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)',
    animation: 'successPulse 2s ease infinite',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.1rem',
    fontWeight: '500',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  infoBox: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  infoText: {
    color: '#047857',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    fontWeight: '500',
  },
  loginButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.1rem 2.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
  },
  autoRedirect: {
    marginTop: '2rem',
    color: '#9ca3af',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
};

// Add dynamic styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .success-card {
      animation: fadeInScale 0.6s ease;
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes successPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 16px 40px rgba(16, 185, 129, 0.6);
      }
    }

    .login-btn-hover:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
    }

    .login-btn-hover:active {
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

export default ResetPasswordSuccess;
