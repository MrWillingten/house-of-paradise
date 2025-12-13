import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader, Lock } from 'lucide-react';
import Modal from './Modal';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  isDestructive = false,
  requirePassword = false,
  darkMode = false
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setLoading(false);
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (requirePassword && !password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(password);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleConfirm();
    }
  };

  return (
    <>
      <style>{confirmationStyles}</style>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="small"
        darkMode={darkMode}
      >
        <div style={styles.content}>
          {/* Warning Icon */}
          <div style={{
            ...styles.iconContainer,
            background: isDestructive
              ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
          }}>
            <AlertTriangle
              size={48}
              color={isDestructive ? '#dc2626' : '#f59e0b'}
              strokeWidth={2.5}
            />
          </div>

          {/* Message */}
          <div
            style={{
              ...styles.message,
              color: darkMode ? '#e5e7eb' : '#374151'
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />

          {/* Password Input (if required) */}
          {requirePassword && (
            <div style={styles.passwordSection}>
              <label
                htmlFor="confirm-password"
                style={{
                  ...styles.passwordLabel,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}
              >
                <Lock size={16} />
                Enter your password to confirm
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                style={{
                  ...styles.passwordInput,
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  color: darkMode ? '#ffffff' : '#1f2937',
                  border: error
                    ? '2px solid #ef4444'
                    : darkMode
                    ? '2px solid #2a2a3e'
                    : '2px solid #e5e7eb'
                }}
                className="input-focus"
                autoFocus
                disabled={loading}
              />
              {error && (
                <div style={styles.error} className="error-shake">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              onClick={onClose}
              style={{
                ...styles.button,
                ...styles.cancelButton,
                background: darkMode ? '#374151' : '#e5e7eb',
                color: darkMode ? '#e5e7eb' : '#374151'
              }}
              className="clickable button-hover-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                ...styles.button,
                ...styles.confirmButton,
                background: isDestructive
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: isDestructive
                  ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                  : '0 4px 16px rgba(16, 185, 129, 0.4)',
                opacity: loading ? 0.7 : 1
              }}
              className={`clickable ${isDestructive ? 'button-hover-danger' : 'button-hover-confirm'}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const confirmationStyles = `
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

  .button-hover-cancel:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .button-hover-confirm:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.6) !important;
  }

  .button-hover-danger:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.6) !important;
  }

  .button-hover-cancel:active:not(:disabled),
  .button-hover-confirm:active:not(:disabled),
  .button-hover-danger:active:not(:disabled) {
    transform: translateY(-1px);
  }

  .clickable {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .clickable:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .error-shake {
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
`;

const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    textAlign: 'center'
  },
  iconContainer: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  message: {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    fontWeight: '500',
    maxWidth: '400px'
  },
  passwordSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  passwordLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  passwordInput: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  error: {
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginTop: '0.25rem'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
    marginTop: '0.5rem'
  },
  button: {
    flex: 1,
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  cancelButton: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  confirmButton: {
    color: '#ffffff'
  }
};

export default ConfirmationModal;
