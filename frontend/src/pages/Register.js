import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { UserPlus, AlertCircle, Mail, Lock, User, Check, X } from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  // Real-time password validation
  const passwordValidation = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Manual validation to prevent page refresh issues
    if (!formData.name || !formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.password) {
      setError('Please enter a password.');
      return;
    }

    // Check password requirements
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData);

      if (response.data.success && response.data.data.requiresVerification) {
        // Navigate to email verification page
        navigate('/verify-email', {
          state: {
            email: response.data.data.email,
            name: response.data.data.name
          }
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.card} className="register-card">
        <div style={styles.header}>
          <div style={styles.icon}>
            <UserPlus size={32} />
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>
            Join House of Paradise and start your journey
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
              <User size={16} style={styles.labelIcon} />
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              className="input-focus"
            />
          </div>

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

            {formData.password && (
              <div style={styles.passwordRequirements}>
                <div style={styles.requirementItem}>
                  {passwordValidation.minLength ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.minLength ? '#10b981' : '#6b7280'
                  }}>
                    At least 8 characters
                  </span>
                </div>

                <div style={styles.requirementItem}>
                  {passwordValidation.hasUppercase ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasUppercase ? '#10b981' : '#6b7280'
                  }}>
                    One uppercase letter
                  </span>
                </div>

                <div style={styles.requirementItem}>
                  {passwordValidation.hasLowercase ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasLowercase ? '#10b981' : '#6b7280'
                  }}>
                    One lowercase letter
                  </span>
                </div>

                <div style={styles.requirementItem}>
                  {passwordValidation.hasNumber ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasNumber ? '#10b981' : '#6b7280'
                  }}>
                    One number
                  </span>
                </div>

                <div style={styles.requirementItem}>
                  {passwordValidation.hasSpecial ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasSpecial ? '#10b981' : '#6b7280'
                  }}>
                    One special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}
          </div>

          <button type="submit" style={styles.submitButton} className="submit-btn-hover" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?
          </p>
          <Link to="/login" style={styles.switchButton} className="switch-btn-hover">
            Login
          </Link>
        </div>
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
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b7280',
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
  helpText: {
    fontSize: '0.82rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  passwordRequirements: {
    marginTop: '0.75rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  requirementText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'color 0.3s ease',
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
    color: '#6b7280',
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
};

// Add dynamic styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .register-card {
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
  `;
  document.head.appendChild(style);
}

export default Register;
