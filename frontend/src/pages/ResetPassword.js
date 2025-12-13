import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, AlertCircle, Eye, EyeOff, Check, X, Sparkles, Shield, Zap, Star, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time password validation
  const passwordValidation = useMemo(() => {
    const password = formData.newPassword;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      passwordsMatch: formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword,
    };
  }, [formData.newPassword, formData.confirmPassword]);

  const isPasswordValid = passwordValidation.minLength &&
    passwordValidation.hasUppercase &&
    passwordValidation.hasLowercase &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSpecial;

  useEffect(() => {
    // Verify token exists
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Manual validation to prevent page refresh issues
    if (!formData.newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    // Password strength check
    const hasUppercase = /[A-Z]/.test(formData.newPassword);
    const hasLowercase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /[0-9]/.test(formData.newPassword);
    const hasSpecial = /[!@#$%^&*]/.test(formData.newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError('Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        token,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        // Navigate to success page
        navigate('/reset-password-success');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      {/* Floating Background Particles */}
      <div className="floating-particles">
        <Sparkles style={{...styles.floatingParticle, top: '15%', left: '10%', animationDelay: '0s'}} size={28} color="rgba(16, 185, 129, 0.3)" />
        <Star style={{...styles.floatingParticle, top: '25%', right: '15%', animationDelay: '1s'}} size={24} color="rgba(251, 191, 36, 0.4)" />
        <Shield style={{...styles.floatingParticle, top: '60%', left: '8%', animationDelay: '2s'}} size={26} color="rgba(16, 185, 129, 0.3)" />
        <Zap style={{...styles.floatingParticle, top: '70%', right: '12%', animationDelay: '1.5s'}} size={22} color="rgba(16, 185, 129, 0.4)" />
        <Sparkles style={{...styles.floatingParticle, bottom: '20%', left: '20%', animationDelay: '0.5s'}} size={20} color="rgba(16, 185, 129, 0.3)" />
        <Star style={{...styles.floatingParticle, bottom: '30%', right: '25%', animationDelay: '2.5s'}} size={18} color="rgba(251, 191, 36, 0.4)" />
      </div>

      <div style={styles.card} className="reset-password-card">
        <div style={styles.header}>
          <div style={styles.icon} className="icon-pulse-glow">
            <Lock size={32} />
            <Shield size={16} style={styles.iconBadge} className="badge-pulse" />
          </div>
          <h1 style={styles.title} className="title-shimmer">Reset Your Password</h1>

          <div style={styles.securityBadge} className="security-badge-float">
            <Shield size={18} color="#10b981" />
            <span>Secure Reset</span>
          </div>

          <p style={styles.subtitle}>
            Choose a new secure password for your account
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
              <Lock size={16} style={styles.labelIcon} />
              New Password
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                style={styles.input}
                className="input-focus"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                style={styles.eyeButton}
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formData.newPassword && (
              <div style={styles.passwordRequirements}>
                <div style={styles.requirementItem} className={passwordValidation.minLength ? 'requirement-item-valid' : ''}>
                  {passwordValidation.minLength ? (
                    <>
                      <Check size={16} color="#10b981" />
                      <Sparkles size={12} color="#10b981" style={{marginLeft: '-4px', opacity: 0.6}} />
                    </>
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.minLength ? '#10b981' : '#6b7280',
                    fontWeight: passwordValidation.minLength ? '600' : '500'
                  }}>
                    At least 8 characters
                  </span>
                </div>

                <div style={styles.requirementItem} className={passwordValidation.hasUppercase ? 'requirement-item-valid' : ''}>
                  {passwordValidation.hasUppercase ? (
                    <>
                      <Check size={16} color="#10b981" />
                      <Sparkles size={12} color="#10b981" style={{marginLeft: '-4px', opacity: 0.6}} />
                    </>
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasUppercase ? '#10b981' : '#6b7280',
                    fontWeight: passwordValidation.hasUppercase ? '600' : '500'
                  }}>
                    One uppercase letter
                  </span>
                </div>

                <div style={styles.requirementItem} className={passwordValidation.hasLowercase ? 'requirement-item-valid' : ''}>
                  {passwordValidation.hasLowercase ? (
                    <>
                      <Check size={16} color="#10b981" />
                      <Sparkles size={12} color="#10b981" style={{marginLeft: '-4px', opacity: 0.6}} />
                    </>
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasLowercase ? '#10b981' : '#6b7280',
                    fontWeight: passwordValidation.hasLowercase ? '600' : '500'
                  }}>
                    One lowercase letter
                  </span>
                </div>

                <div style={styles.requirementItem} className={passwordValidation.hasNumber ? 'requirement-item-valid' : ''}>
                  {passwordValidation.hasNumber ? (
                    <>
                      <Check size={16} color="#10b981" />
                      <Sparkles size={12} color="#10b981" style={{marginLeft: '-4px', opacity: 0.6}} />
                    </>
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasNumber ? '#10b981' : '#6b7280',
                    fontWeight: passwordValidation.hasNumber ? '600' : '500'
                  }}>
                    One number
                  </span>
                </div>

                <div style={styles.requirementItem} className={passwordValidation.hasSpecial ? 'requirement-item-valid' : ''}>
                  {passwordValidation.hasSpecial ? (
                    <>
                      <Check size={16} color="#10b981" />
                      <Sparkles size={12} color="#10b981" style={{marginLeft: '-4px', opacity: 0.6}} />
                    </>
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.hasSpecial ? '#10b981' : '#6b7280',
                    fontWeight: passwordValidation.hasSpecial ? '600' : '500'
                  }}>
                    One special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Lock size={16} style={styles.labelIcon} />
              Confirm New Password
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                style={styles.input}
                className="input-focus"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                style={styles.eyeButton}
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formData.confirmPassword && (
              <div style={{
                ...styles.passwordMatchBox,
                background: passwordValidation.passwordsMatch
                  ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                  : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: passwordValidation.passwordsMatch
                  ? '2px solid #6ee7b7'
                  : '2px solid #fca5a5',
              }}>
                {passwordValidation.passwordsMatch ? (
                  <>
                    <CheckCircle size={18} color="#10b981" />
                    <Sparkles size={14} color="#10b981" style={{marginLeft: '-4px', opacity: 0.6}} />
                    <span style={{ ...styles.requirementText, color: '#065f46', fontWeight: '700' }}>
                      Passwords match!
                    </span>
                    <Zap size={14} color="#10b981" style={{marginLeft: 'auto'}} className="zap-pulse" />
                  </>
                ) : (
                  <>
                    <X size={18} color="#ef4444" />
                    <span style={{ ...styles.requirementText, color: '#991b1b', fontWeight: '600' }}>
                      Passwords do not match
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            className="submit-btn-hover"
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
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
    fontSize: '0.95rem',
  },
  warningBox: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '2px solid #fbbf24',
    color: '#92400e',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '600',
    fontSize: '0.9rem',
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
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '1rem',
    paddingRight: '3.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.3s ease',
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
  passwordMatchBox: {
    marginTop: '0.75rem',
    padding: '0.75rem 1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
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
    marginTop: '0.5rem',
  },
  lockedBox: {
    background: '#fee2e2',
    border: '2px solid #fca5a5',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '2rem',
    textAlign: 'center',
  },
  lockedText: {
    color: '#991b1b',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  requestNewLink: {
    display: 'block',
    color: '#10b981',
    fontWeight: '700',
    textDecoration: 'underline',
    marginTop: '0.5rem',
  },
  securityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    padding: '0.5rem 1.25rem',
    borderRadius: '50px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#065f46',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    border: '2px solid rgba(16, 185, 129, 0.4)',
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
  },
  iconBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%',
    padding: '6px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.5)',
  },
  floatingParticle: {
    position: 'absolute',
    animation: 'float 4s ease-in-out infinite',
    opacity: 0.6,
    pointerEvents: 'none',
  },
};

// Add dynamic styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .reset-password-card {
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

    .error-shake {
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    button[style*="eyeButton"]:hover:not(:disabled) {
      color: #10b981 !important;
    }

    /* EPIC NEW ANIMATIONS */
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.4;
      }
      50% {
        transform: translateY(-30px) rotate(180deg);
        opacity: 0.8;
      }
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      }
      50% {
        box-shadow: 0 12px 36px rgba(16, 185, 129, 0.7),
                    0 0 40px rgba(16, 185, 129, 0.3);
      }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    @keyframes badge-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @keyframes badge-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.15);
        opacity: 0.8;
      }
    }

    @keyframes check-pop {
      0% {
        transform: scale(0.8);
      }
      50% {
        transform: scale(1.15);
      }
      100% {
        transform: scale(1);
      }
    }

    .icon-pulse-glow {
      animation: pulse-glow 3s ease-in-out infinite;
    }

    .title-shimmer {
      background: linear-gradient(90deg, #1a1a1a 0%, #10b981 50%, #1a1a1a 100%);
      background-size: 2000px 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .security-badge-float {
      animation: badge-float 2s ease-in-out infinite;
    }

    .badge-pulse {
      animation: badge-pulse 2s ease-in-out infinite;
    }

    .floating-particles > * {
      animation: float 4s ease-in-out infinite;
    }

    /* Enhanced input glow on focus */
    .input-focus:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2),
                  0 0 20px rgba(16, 185, 129, 0.4),
                  0 4px 12px rgba(16, 185, 129, 0.3) !important;
      transform: translateY(-2px);
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%) !important;
    }

    /* Enhanced button hover with glow */
    .submit-btn-hover:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5),
                  0 0 40px rgba(16, 185, 129, 0.3);
    }

    /* Animate checkmarks when they appear */
    svg[color="#10b981"] {
      animation: check-pop 0.4s ease-out;
    }

    /* Enhanced password requirement item on success */
    .requirement-item-valid {
      transition: all 0.3s ease;
      transform: translateX(3px);
    }

    @keyframes zap-pulse {
      0%, 100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: scale(1.3) rotate(15deg);
        opacity: 0.7;
      }
    }

    .zap-pulse {
      animation: zap-pulse 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export default ResetPassword;
