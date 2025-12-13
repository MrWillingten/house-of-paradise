import React, { useState, useEffect } from 'react';
import { Mail, Check, X, AlertCircle, Loader, Shield } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function EmailEditor({ currentEmail, isVerified = true, darkMode = false, onEmailChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time email validation
  useEffect(() => {
    if (newEmail === '') {
      setIsValidEmail(null);
      setEmailError('');
      return;
    }

    if (emailRegex.test(newEmail)) {
      setIsValidEmail(true);
      setEmailError('');
    } else {
      setIsValidEmail(false);
      setEmailError('Invalid email format. Please enter a valid email address.');
    }
  }, [newEmail]);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewEmail('');
    setPassword('');
    setEmailError('');
    setSuccessMessage('');
    setErrorMessage('');
    setIsValidEmail(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewEmail('');
    setPassword('');
    setEmailError('');
    setSuccessMessage('');
    setErrorMessage('');
    setIsValidEmail(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Validate password is provided
    if (!password.trim()) {
      setErrorMessage('Password is required to change email');
      return;
    }

    // Check if new email is same as current
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setErrorMessage('New email must be different from current email');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // API call to change email
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newEmail,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show verification message
        setSuccessMessage(`Verification email sent to ${newEmail}. Please check your inbox and verify your new email address.`);
        setPendingEmail(newEmail);
        setIsEditing(false);
        setNewEmail('');
        setPassword('');

        // Notify parent component
        if (onEmailChange) {
          onEmailChange(newEmail, false);
        }
      } else {
        // Error from server
        setErrorMessage(data.message || 'Failed to change email. Please try again.');
      }
    } catch (error) {
      console.error('Email change error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: pendingEmail || currentEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Verification email sent successfully!');
      } else {
        setErrorMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = () => {
    if (newEmail === '') {
      return darkMode ? '#2a2a3e' : '#e5e7eb';
    }
    return isValidEmail ? '#10b981' : '#ef4444';
  };

  const getValidationIcon = () => {
    if (newEmail === '' || isValidEmail === null) return null;

    if (isValidEmail) {
      return <Check size={20} color="#10b981" />;
    }
    return <X size={20} color="#ef4444" />;
  };

  return (
    <>
      <style>{emailEditorAnimations}</style>

      <div className="email-editor-card" style={{
        ...styles.card,
        background: darkMode
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
      }}>
        {/* Card Header */}
        <div style={styles.cardHeader}>
          <h2 style={{
            ...styles.cardTitle,
            color: darkMode ? '#ffffff' : '#1f2937',
          }}>
            <Mail size={24} color="#10b981" />
            <span>Email Settings</span>
          </h2>
        </div>

        {/* Card Body */}
        <div style={styles.cardBody}>
          {/* Current Email Display */}
          {!isEditing && (
            <div className="fade-in">
              <div style={styles.currentEmailSection}>
                <div style={styles.emailHeader}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <Mail size={18} color="#0ea5e9" />
                    <span>Current Email Address</span>
                  </label>

                  {/* Verification Badge */}
                  <div style={{
                    ...styles.badge,
                    background: isVerified
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                    border: isVerified
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(245, 158, 11, 0.3)',
                  }}>
                    {isVerified ? (
                      <>
                        <Check size={16} color="#10b981" />
                        <span style={{ color: '#10b981' }}>Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} color="#f59e0b" />
                        <span style={{ color: '#f59e0b' }}>Pending Verification</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{
                  ...styles.emailDisplay,
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                }}>
                  <Mail size={20} color="#10b981" />
                  <span style={{
                    color: darkMode ? '#e5e7eb' : '#1f2937',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                  }}>
                    {currentEmail}
                  </span>
                </div>

                {/* Resend Verification Link */}
                {!isVerified && (
                  <div style={styles.verificationNote}>
                    <AlertCircle size={16} color="#f59e0b" />
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Please verify your email address.{' '}
                      <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        style={styles.resendLink}
                        className="clickable"
                      >
                        Resend verification email
                      </button>
                    </span>
                  </div>
                )}

                {/* Change Email Button */}
                <button
                  onClick={handleEditClick}
                  style={{
                    ...styles.editButton,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }}
                  className="clickable hover-lift"
                >
                  <Mail size={18} />
                  <span>Change Email Address</span>
                </button>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="slide-in">
              <div style={styles.formSection}>
                {/* New Email Input */}
                <div style={styles.field}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <Mail size={18} color="#10b981" />
                    <span>New Email Address</span>
                  </label>

                  <div style={styles.inputWrapper}>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#ffffff',
                        color: darkMode ? '#fff' : '#1f2937',
                        border: `2px solid ${getInputBorderColor()}`,
                        paddingRight: '3rem',
                      }}
                      autoFocus
                    />
                    <div style={styles.validationIcon}>
                      {getValidationIcon()}
                    </div>
                  </div>

                  {/* Error Message */}
                  {emailError && (
                    <div style={styles.errorText} className="error-shake">
                      <X size={16} color="#ef4444" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  {/* Success Indicator */}
                  {isValidEmail && newEmail !== '' && (
                    <div style={styles.successText}>
                      <Check size={16} color="#10b981" />
                      <span>Valid email format</span>
                    </div>
                  )}
                </div>

                {/* Password Confirmation */}
                <div style={styles.field}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <Shield size={18} color="#ef4444" />
                    <span>Confirm Password (Security)</span>
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your current password"
                    style={{
                      ...styles.input,
                      background: darkMode ? '#0f0f1a' : '#ffffff',
                      color: darkMode ? '#fff' : '#1f2937',
                      border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
                    }}
                  />

                  <div style={styles.securityNote}>
                    <Shield size={14} color="#6b7280" />
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      For security, we need to verify your identity
                    </span>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{
                  ...styles.infoBox,
                  background: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)',
                  border: darkMode ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid rgba(14, 165, 233, 0.2)',
                }}>
                  <AlertCircle size={20} color="#0ea5e9" />
                  <div>
                    <p style={{
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                      Email Change Process
                    </p>
                    <ul style={{
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      fontSize: '0.9rem',
                      marginLeft: '1.25rem',
                      lineHeight: '1.6',
                    }}>
                      <li>We'll send a verification link to your new email address</li>
                      <li>Click the link to verify your new email</li>
                      <li>Your current email remains active until verification</li>
                      <li>The change takes effect immediately after verification</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actionButtons}>
                  <button
                    type="submit"
                    disabled={loading || !isValidEmail || !password.trim()}
                    style={{
                      ...styles.submitButton,
                      background: (loading || !isValidEmail || !password.trim())
                        ? darkMode ? '#4b5563' : '#d1d5db'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      cursor: (loading || !isValidEmail || !password.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (loading || !isValidEmail || !password.trim()) ? 0.6 : 1,
                    }}
                    className={(!loading && isValidEmail && password.trim()) ? 'clickable hover-lift' : ''}
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="spinner" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Send Verification Email</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    style={{
                      ...styles.cancelButton,
                      background: darkMode ? '#ef4444' : '#fee2e2',
                      color: darkMode ? '#fff' : '#dc2626',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                    }}
                    className={!loading ? 'clickable hover-lift' : ''}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={{
              ...styles.alertBox,
              background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
              border: darkMode ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
            }} className="success-pulse">
              <Check size={20} color="#10b981" />
              <span style={{ color: darkMode ? '#6ee7b7' : '#059669' }}>
                {successMessage}
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              ...styles.alertBox,
              background: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
              border: darkMode ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
            }} className="error-shake">
              <X size={20} color="#ef4444" />
              <span style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                {errorMessage}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const emailEditorAnimations = `
  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .hover-lift {
    transition: all 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .fade-in {
    animation: fadeIn 0.5s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .slide-in {
    animation: slideIn 0.4s ease forwards;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.95;
      transform: scale(1.01);
    }
  }

  .email-editor-card {
    animation: cardSlideUp 0.6s ease forwards;
  }

  @keyframes cardSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: '800',
    margin: 0,
  },
  cardBody: {
    padding: '2rem',
  },
  currentEmailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  emailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  emailDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  },
  verificationNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    marginTop: '-0.5rem',
  },
  resendLink: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    fontWeight: '600',
    textDecoration: 'underline',
    padding: 0,
    fontSize: '0.9rem',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  validationIcon: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ef4444',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '-0.25rem',
  },
  successText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#10b981',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '-0.25rem',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  infoBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  submitButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease',
  },
  cancelButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    marginTop: '1.5rem',
  },
};

export default EmailEditor;
