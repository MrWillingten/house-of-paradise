import React, { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, Check, X, Loader } from 'lucide-react';
import api from '../services/api';

function PasswordChange({ darkMode = false, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Real-time password validation (same as Register.js)
  const passwordValidation = useMemo(() => {
    const password = formData.newPassword;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [formData.newPassword]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Check if confirm password matches
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';

  // Check if form is valid for submission
  const isFormValid =
    formData.currentPassword &&
    isPasswordValid &&
    passwordsMatch;

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!formData.newPassword) return { label: '', color: '' };

    const validCount = Object.values(passwordValidation).filter(Boolean).length;

    if (validCount <= 2) {
      return { label: 'Weak', color: '#ef4444' };
    } else if (validCount <= 4) {
      return { label: 'Medium', color: '#f59e0b' };
    } else {
      return { label: 'Strong', color: '#10b981' };
    }
  };

  const passwordStrength = getPasswordStrength();

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Password change error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to change password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{passwordChangeStyles}</style>

      <div className="scroll-reveal spotlight-card" style={{
        ...styles.card,
        background: darkMode
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
      }}>
        <div style={styles.cardHeader}>
          <h2 style={{
            ...styles.cardTitle,
            color: darkMode ? '#ffffff' : '#1f2937',
          }}>
            <Lock size={24} color="#10b981" />
            <span>Change Password</span>
          </h2>
        </div>

        {error && (
          <div style={styles.errorBox} className="error-shake">
            <X size={20} style={{ flexShrink: 0, color: '#ef4444' }} />
            <div style={styles.messageContent}>
              {error.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {success && (
          <div style={styles.successBox} className="success-pulse">
            <Check size={20} style={{ flexShrink: 0, color: '#10b981' }} />
            <div style={styles.messageContent}>
              {success}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.cardBody}>
          {/* Current Password */}
          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}>
              <Lock size={16} style={styles.labelIcon} />
              Current Password
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                style={{
                  ...styles.input,
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  color: darkMode ? '#fff' : '#1f2937',
                  border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                }}
                className="input-focus"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                style={styles.eyeButton}
                className="clickable"
              >
                {showPasswords.current ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}>
              <Lock size={16} style={styles.labelIcon} />
              New Password
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                style={{
                  ...styles.input,
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  color: darkMode ? '#fff' : '#1f2937',
                  border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                }}
                className="input-focus"
                required
                minLength="8"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                style={styles.eyeButton}
                className="clickable"
              >
                {showPasswords.new ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div style={styles.strengthBar}>
                <div
                  style={{
                    ...styles.strengthFill,
                    width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%`,
                    background: passwordStrength.color,
                  }}
                />
              </div>
            )}

            {formData.newPassword && (
              <div style={styles.strengthLabel}>
                <span style={{ color: passwordStrength.color, fontWeight: '700' }}>
                  Password Strength: {passwordStrength.label}
                </span>
              </div>
            )}

            {/* Password Requirements */}
            {formData.newPassword && (
              <div style={{
                ...styles.passwordRequirements,
                background: darkMode ? '#0f0f1a' : '#f9fafb',
                border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
              }}>
                <div style={styles.requirementItem}>
                  {passwordValidation.minLength ? (
                    <Check size={16} color="#10b981" />
                  ) : (
                    <X size={16} color="#ef4444" />
                  )}
                  <span style={{
                    ...styles.requirementText,
                    color: passwordValidation.minLength
                      ? '#10b981'
                      : (darkMode ? '#9ca3af' : '#6b7280')
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
                    color: passwordValidation.hasUppercase
                      ? '#10b981'
                      : (darkMode ? '#9ca3af' : '#6b7280')
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
                    color: passwordValidation.hasLowercase
                      ? '#10b981'
                      : (darkMode ? '#9ca3af' : '#6b7280')
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
                    color: passwordValidation.hasNumber
                      ? '#10b981'
                      : (darkMode ? '#9ca3af' : '#6b7280')
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
                    color: passwordValidation.hasSpecial
                      ? '#10b981'
                      : (darkMode ? '#9ca3af' : '#6b7280')
                  }}>
                    One special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}>
              <Lock size={16} style={styles.labelIcon} />
              Confirm New Password
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                style={{
                  ...styles.input,
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  color: darkMode ? '#fff' : '#1f2937',
                  border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                }}
                className="input-focus"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                style={styles.eyeButton}
                className="clickable"
              >
                {showPasswords.confirm ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div style={styles.matchIndicator}>
                {passwordsMatch ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                    <Check size={16} />
                    <span style={styles.matchText}>Passwords match</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                    <X size={16} />
                    <span style={styles.matchText}>Passwords do not match</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: !isFormValid || loading ? 0.6 : 1,
            }}
            className="submit-btn-hover"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="spinner" />
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>Change Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}

const passwordChangeStyles = `
  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

  .success-pulse {
    animation: pulse 0.5s ease;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0; }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); opacity: 1; }
  }

  .clickable {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clickable:hover {
    opacity: 0.8;
  }

  .scroll-reveal {
    animation: fadeInUp 0.6s ease;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .spotlight-card:hover {
    box-shadow: 0 25px 70px rgba(0,0,0,0.15);
  }
`;

const styles = {
  card: {
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    marginBottom: '2rem',
  },
  cardHeader: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  cardBody: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  errorBox: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '2px solid #fca5a5',
    color: '#991b1b',
    padding: '1.2rem',
    margin: '0 2rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
  },
  successBox: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    border: '2px solid #6ee7b7',
    color: '#065f46',
    padding: '1.2rem',
    margin: '0 2rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
  },
  messageContent: {
    flex: 1,
    lineHeight: '1.6',
    fontWeight: '500',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  labelIcon: {
    color: '#10b981',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '1rem',
    paddingRight: '3rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  eyeButton: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthBar: {
    marginTop: '0.5rem',
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: '3px',
  },
  strengthLabel: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  passwordRequirements: {
    marginTop: '0.75rem',
    padding: '1rem',
    borderRadius: '8px',
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
  matchIndicator: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  matchText: {
    fontWeight: '600',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
};

export default PasswordChange;
