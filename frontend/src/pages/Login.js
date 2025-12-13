import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { LogIn, AlertCircle, Mail, Lock, Shield, Key, Unlock, CheckCircle } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Dark mode state - read from localStorage, default to false (light mode)
  const [darkMode, setDarkMode] = useState(() => {
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

  // 2FA states
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Disabled account states - NEW FLOW
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [disabledEmail, setDisabledEmail] = useState('');
  const [showUnlockCode, setShowUnlockCode] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockCodeSent, setUnlockCodeSent] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Apply dark mode class to body - ensure correct state on mount
  useEffect(() => {
    // Always sync body class with darkMode state
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Cleanup on unmount - remove dark-mode class to prevent issues
    return () => {
      // Don't remove on unmount as other pages will handle it
    };
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
    setSuccessMessage('');

    // Manual validation to prevent page refresh issues
    if (!formData.email || !formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Check if 2FA is required
        if (response.data.requiresTwoFactor) {
          setUserId(response.data.userId);
          setShowTwoFactor(true);
          setFailedAttempts(0);
          setLoading(false);
          return;
        }

        // Reset failed attempts on successful login
        setFailedAttempts(0);

        // Handle normal login response
        const accessToken = response.data.data?.accessToken || response.data.accessToken;
        const refreshToken = response.data.data?.refreshToken || response.data.refreshToken;
        const user = response.data.data?.user || response.data.user;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please try again.';

      // Handle unverified user trying to login
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-email', {
          state: { email: err.response.data.email || formData.email, name: 'User' }
        });
        return;
      }

      // Handle disabled account - NEW FLOW
      if (err.response?.data?.accountDisabled) {
        setAccountDisabled(true);
        setDisabledEmail(formData.email);
        setError('');
        setLoading(false);
        return;
      }

      // Increment failed attempts on login error
      setFailedAttempts(prev => prev + 1);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyTwoFactorLogin({
        userId,
        code: twoFactorCode,
      });

      if (response.data.success) {
        const accessToken = response.data.data?.accessToken || response.data.data.token;
        const refreshToken = response.data.data?.refreshToken;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Redirect based on role
        if (response.data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Request unlock code via email
  const handleRequestUnlock = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await authService.requestUnlock({ email: disabledEmail });

      if (response.data.success) {
        setUnlockCodeSent(true);
        setShowUnlockCode(true);
        setSuccessMessage('Unlock code sent to your email! Check your inbox.');
      }
    } catch (err) {
      console.error('Request unlock error:', err);
      setError(err.response?.data?.message || 'Failed to send unlock code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Verify unlock code and re-enable account
  const handleVerifyUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await authService.verifyUnlock({
        email: disabledEmail,
        code: unlockCode,
      });

      if (response.data.success) {
        // Account unlocked - store tokens and redirect
        const accessToken = response.data.data?.accessToken;
        const refreshToken = response.data.data?.refreshToken;
        const user = response.data.data?.user;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));

        // Show success briefly then redirect
        setSuccessMessage('Account unlocked successfully! Redirecting...');
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Verify unlock error:', err);
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowTwoFactor(false);
    setUseBackupCode(false);
    setTwoFactorCode('');
    setUserId(null);
    setAccountDisabled(false);
    setDisabledEmail('');
    setShowUnlockCode(false);
    setUnlockCode('');
    setUnlockCodeSent(false);
    setError('');
    setSuccessMessage('');
  };

  // Dynamic styles based on dark mode
  const getStyles = () => ({
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
      background: darkMode ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '3rem',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
      position: 'relative',
      zIndex: 1,
      border: darkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
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
    title: {
      fontSize: '2.2rem',
      fontWeight: '800',
      background: darkMode
        ? 'linear-gradient(135deg, #f9fafb 0%, #10b981 100%)'
        : 'linear-gradient(135deg, #1a1a1a 0%, #10b981 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: darkMode ? '#d1d5db' : '#6b7280',
      fontSize: '1.05rem',
      fontWeight: '500',
    },
    errorBox: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      border: '2px solid #fca5a5',
      color: '#991b1b',
      padding: '1.2rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    },
    errorContent: {
      flex: 1,
      lineHeight: '1.6',
      fontWeight: '500',
    },
    successBox: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      border: '2px solid #6ee7b7',
      color: '#065f46',
      padding: '1.2rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    },
    successContent: {
      flex: 1,
      lineHeight: '1.6',
      fontWeight: '500',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    },
    label: {
      fontSize: '0.95rem',
      fontWeight: '700',
      color: darkMode ? '#f9fafb' : '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    labelIcon: {
      color: '#10b981',
    },
    input: {
      padding: '1rem',
      border: darkMode ? '2px solid #4b5563' : '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      background: darkMode ? 'rgba(55, 65, 81, 0.8)' : '#ffffff',
      color: darkMode ? '#f9fafb' : '#1f2937',
    },
    forgotPasswordContainer: {
      textAlign: 'center',
      marginTop: '-0.5rem',
    },
    forgotPasswordLink: {
      display: 'inline-flex',
      alignItems: 'center',
      color: '#10b981',
      fontSize: '0.95rem',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
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
      marginTop: '0.5rem',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    },
    footer: {
      marginTop: '2.5rem',
      textAlign: 'center',
    },
    footerText: {
      color: darkMode ? '#d1d5db' : '#6b7280',
      marginBottom: '0.75rem',
      fontSize: '0.95rem',
      fontWeight: '500',
    },
    switchButton: {
      color: '#10b981',
      fontSize: '1.05rem',
      fontWeight: '700',
      textDecoration: 'underline',
      transition: 'all 0.3s ease',
    },
    twoFactorLinks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '1rem',
      alignItems: 'center',
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#10b981',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '0.5rem',
      transition: 'all 0.3s ease',
      textDecoration: 'underline',
    },
    // Account Locked styles
    lockedEmailBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      background: darkMode ? 'rgba(55, 65, 81, 0.5)' : '#f3f4f6',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
    },
    lockedEmail: {
      fontSize: '1rem',
      fontWeight: '600',
      color: darkMode ? '#f9fafb' : '#374151',
    },
    unlockInstructions: {
      color: darkMode ? '#d1d5db' : '#6b7280',
      fontSize: '0.95rem',
      textAlign: 'center',
      lineHeight: '1.6',
      marginBottom: '0.5rem',
    },
    codeHint: {
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '0.85rem',
      marginTop: '0.25rem',
    },
    resendButton: {
      background: 'none',
      border: 'none',
      color: '#10b981',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '0.5rem',
      textAlign: 'center',
      textDecoration: 'underline',
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '0.5rem',
      textDecoration: 'underline',
    },
  });

  const styles = getStyles();

  // Render 2FA screen
  if (showTwoFactor) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundGradient}></div>

        <div style={styles.card} className="login-card">
          <div style={styles.header}>
            <div style={styles.icon}>
              {useBackupCode ? <Key size={32} /> : <Shield size={32} />}
            </div>
            <h1 style={styles.title}>
              {useBackupCode ? 'Enter Backup Code' : 'Two-Factor Authentication'}
            </h1>
            <p style={styles.subtitle}>
              {useBackupCode
                ? 'Enter one of your 10-digit backup codes'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </p>
          </div>

          {error && (
            <div style={styles.errorBox} className="error-shake">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={styles.errorContent}>{error}</div>
            </div>
          )}

          <form onSubmit={handleTwoFactorVerify} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {useBackupCode ? <Key size={16} style={styles.labelIcon} /> : <Shield size={16} style={styles.labelIcon} />}
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </label>
              <input
                type="text"
                placeholder={useBackupCode ? '••••••••' : '••••••'}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                style={styles.input}
                className="input-focus"
                required
                maxLength={useBackupCode ? 8 : 6}
                pattern={useBackupCode ? '[0-9A-F]{8}' : '[0-9]{6}'}
              />
            </div>

            <button type="submit" style={styles.submitButton} className="submit-btn-hover" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <div style={styles.twoFactorLinks}>
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorCode('');
                  setError('');
                }}
                style={styles.linkButton}
                className="link-btn-hover"
              >
                {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
              </button>
              <button
                type="button"
                onClick={handleBackToLogin}
                style={styles.linkButton}
                className="link-btn-hover"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // NEW: Render Account Locked screen
  if (accountDisabled) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundGradient}></div>

        <div style={styles.card} className="login-card">
          <div style={styles.header}>
            <div style={{...styles.icon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'}}>
              <Unlock size={32} />
            </div>
            <h1 style={styles.title}>Account Locked</h1>
            <p style={styles.subtitle}>
              Your account has been disabled. To unlock it, we'll send a verification code to your email.
            </p>
          </div>

          {error && (
            <div style={styles.errorBox} className="error-shake">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={styles.errorContent}>{error}</div>
            </div>
          )}

          {successMessage && (
            <div style={styles.successBox}>
              <CheckCircle size={20} style={{ flexShrink: 0 }} />
              <div style={styles.successContent}>{successMessage}</div>
            </div>
          )}

          <div style={styles.lockedEmailBox}>
            <Mail size={18} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
            <span style={styles.lockedEmail}>{disabledEmail}</span>
          </div>

          {!showUnlockCode ? (
            <div style={styles.form}>
              <p style={styles.unlockInstructions}>
                Click the button below to receive a 6-digit unlock code at your email address.
              </p>
              <button
                type="button"
                onClick={handleRequestUnlock}
                style={styles.submitButton}
                className="submit-btn-hover"
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Send Unlock Code'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyUnlock} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Key size={16} style={styles.labelIcon} />
                  Unlock Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={styles.input}
                  className="input-focus"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <p style={styles.codeHint}>Check your email for the unlock code</p>
              </div>

              <button type="submit" style={styles.submitButton} className="submit-btn-hover" disabled={loading || unlockCode.length !== 6}>
                {loading ? 'Unlocking...' : 'Unlock Account'}
              </button>

              <button
                type="button"
                onClick={handleRequestUnlock}
                style={styles.resendButton}
                className="link-btn-hover"
                disabled={loading}
              >
                Resend Code
              </button>
            </form>
          )}

          <div style={styles.footer}>
            <button
              type="button"
              onClick={handleBackToLogin}
              style={styles.backButton}
              className="link-btn-hover"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.card} className="login-card">
        <div style={styles.header}>
          <div style={styles.icon}>
            <LogIn size={32} />
          </div>
          <h1 style={styles.title}>Welcome Back!</h1>
          <p style={styles.subtitle}>
            Login to continue your journey
          </p>
        </div>

        {error && (
          <div style={styles.errorBox} className="error-shake">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={styles.errorContent}>
              {error.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
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
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              className="input-focus"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Lock size={16} style={styles.labelIcon} />
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={styles.input}
              className="input-focus"
            />
          </div>

          {/* Show Forgot Password after 2-3 failed attempts */}
          {failedAttempts >= 2 && (
            <div style={styles.forgotPasswordContainer}>
              <Link to="/forgot-password" style={styles.forgotPasswordLink}>
                <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
                Forgot your password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            style={styles.submitButton}
            className="submit-btn-hover"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?
          </p>
          <Link to="/register" style={styles.switchButton} className="switch-btn-hover">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

// Add dynamic styles (only for animations, not colors)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .login-card {
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

    .switch-btn-hover:hover {
      color: #059669;
      transform: scale(1.05);
    }

    .error-shake {
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    .login-card a {
      transition: all 0.3s ease;
    }

    .login-card a:hover {
      color: #059669;
      transform: translateY(-2px);
    }

    .link-btn-hover:hover {
      color: #059669;
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);
}

export default Login;
