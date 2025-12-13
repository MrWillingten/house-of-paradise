import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Manual validation to prevent page refresh issues
    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword({ email });

      // Check for success
      if (response.data.success || response.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);

      // Conditional user-friendly error messages
      let errorMsg;

      if (!err.response) {
        // Network error - no response from server
        errorMsg = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (err.response.status === 404) {
        // Email not found
        errorMsg = "We couldn't find an account with that email address. Please check your email and try again, or create a new account.";
      } else if (err.response.status === 429) {
        // Too many requests
        errorMsg = "Too many password reset requests. Please wait a few minutes and try again.";
      } else if (err.response.status === 500) {
        // Server error
        errorMsg = "Something went wrong on our end. Please try again in a few moments.";
      } else if (err.response.data?.error) {
        // Use server's error message if available
        errorMsg = err.response.data.error;
      } else {
        // Generic fallback
        errorMsg = "Oops! Something went wrong. Please try again.";
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundGradient}></div>

        <div style={styles.card} className="forgot-password-card">
          <div style={styles.successIcon}>
            <CheckCircle size={48} />
          </div>

          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.subtitle}>
            We've sent password reset instructions to <strong>{email}</strong>
          </p>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Click the link in the email to reset your password. The link will expire in 1 hour for security reasons.
            </p>
            <p style={styles.infoText}>
              Didn't receive the email? Check your spam folder or <button onClick={() => setSuccess(false)} style={styles.retryButton}>try again</button>.
            </p>
          </div>

          <Link to="/login" style={styles.backButton} className="back-btn-hover">
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.card} className="forgot-password-card">
        <div style={styles.header}>
          <div style={styles.icon}>
            <Mail size={32} />
          </div>
          <h1 style={styles.title}>Forgot Password?</h1>
          <p style={styles.subtitle}>
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {error && (
          <div style={styles.errorBox} className="error-shake">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Mail size={16} style={styles.labelIcon} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              className="input-focus"
              autoFocus
            />
          </div>

          <button type="submit" style={styles.submitButton} className="submit-btn-hover" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" style={styles.backLink} className="back-link-hover">
          <ArrowLeft size={18} />
          Back to Login
        </Link>
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
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  icon: {
    width: '72px',
    height: '72px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    margin: '0 auto 1.5rem',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
  },
  successIcon: {
    width: '96px',
    height: '96px',
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
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.05rem',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  errorBox: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '2px solid #fca5a5',
    color: '#991b1b',
    padding: '1.2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  labelIcon: {
    color: '#10b981',
  },
  input: {
    padding: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontWeight: '500',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '1.1rem',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#10b981',
    fontSize: '0.95rem',
    fontWeight: '600',
    textDecoration: 'none',
    marginTop: '2rem',
    transition: 'all 0.3s ease',
    justifyContent: 'center',
  },
  infoBox: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  infoText: {
    color: '#047857',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '0.75rem',
    fontWeight: '500',
  },
  retryButton: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    fontWeight: '700',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 'inherit',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'white',
    border: '2px solid #10b981',
    borderRadius: '12px',
    color: '#10b981',
    fontSize: '1.05rem',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    marginTop: '2rem',
  },
};

// Add dynamic styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .forgot-password-card {
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

    .input-focus:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
      transform: translateY(-2px);
    }

    .submit-btn-hover:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
    }

    .submit-btn-hover:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .submit-btn-hover:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .back-link-hover:hover,
    .back-btn-hover:hover {
      color: #059669;
      transform: translateY(-2px);
    }

    .back-btn-hover:hover {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }

    .error-shake {
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `;
  document.head.appendChild(style);
}

export default ForgotPassword;
