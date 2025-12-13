import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Info,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';

const TwoFactorSetup = ({ isOpen, onClose, onComplete, darkMode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 state
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Step 3 state
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Step 4 state
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const codeInputRef = useRef(null);

  // Focus code input when step 3 is reached
  useEffect(() => {
    if (currentStep === 3 && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [currentStep]);

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (verificationCode.length === 6 && currentStep === 3) {
      verifyCode();
    }
  }, [verificationCode]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setCurrentStep(1);
    setIsLoading(false);
    setQrCode('');
    setSecret('');
    setCopiedSecret(false);
    setVerificationCode('');
    setVerificationError('');
    setBackupCodes([]);
    setCopiedBackupCodes(false);
    setConfirmationChecked(false);
  };

  // Step 1: Start setup and get QR code
  const startSetup = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/enable-2fa',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setQrCode(response.data.data.otpauthUrl);  // Use otpauth URI for QRCodeSVG
      setSecret(response.data.data.secret);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      alert(error.response?.data?.message || 'Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Move to verification
  const proceedToVerification = () => {
    setCurrentStep(3);
  };

  // Step 3: Verify code
  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      return;
    }

    setIsLoading(true);
    setVerificationError('');

    try {
      const response = await axios.post(
        '/api/auth/verify-2fa-setup',
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setBackupCodes(response.data.backupCodes || []);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationError('Invalid code. Please try again.');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Complete setup
  const completeSetup = () => {
    if (!confirmationChecked) {
      alert('Please confirm that you have saved your backup codes.');
      return;
    }

    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  // Copy secret key to clipboard
  const copySecretKey = () => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    });
  };

  // Copy all backup codes to clipboard
  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2000);
    });
  };

  // Download backup codes as .txt file
  const downloadBackupCodes = () => {
    const text = `Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes safely. Each code can only be used once.

${backupCodes.join('\n')}

Keep these codes in a secure location. You will need them if you lose access to your authenticator app.`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle verification code input (numeric only)
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setVerificationError('');
  };

  if (!isOpen) return null;

  const styles = getStyles(darkMode);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {currentStep === 1 && 'Enable Two-Factor Authentication'}
            {currentStep === 2 && 'Scan QR Code'}
            {currentStep === 3 && 'Verify Code'}
            {currentStep === 4 && 'Save Your Backup Codes'}
          </h2>
          <button
            onClick={onClose}
            style={styles.closeButton}
            className="clickable"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progressContainer}>
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div
                style={{
                  ...styles.progressStep,
                  ...(currentStep >= step ? styles.progressStepActive : {}),
                }}
              >
                {currentStep > step ? <Check size={16} /> : step}
              </div>
              {step < 4 && (
                <div
                  style={{
                    ...styles.progressLine,
                    ...(currentStep > step ? styles.progressLineActive : {}),
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={styles.stepIndicator}>
          Step {currentStep} of 4
        </div>

        {/* Step Content */}
        <div style={styles.content}>
          {/* Step 1: Introduction */}
          {currentStep === 1 && (
            <div style={styles.stepContent}>
              <div style={styles.iconContainer}>
                <ShieldCheck size={64} style={{ color: '#10b981' }} />
              </div>

              <h3 style={styles.stepTitle}>Secure Your Account</h3>

              <p style={styles.description}>
                Two-Factor Authentication (2FA) adds an extra layer of security to your account
                by requiring a verification code from your phone in addition to your password.
              </p>

              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <Shield size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <div style={styles.featureTitle}>Enhanced Security</div>
                    <div style={styles.featureDescription}>
                      Protect your account even if your password is compromised
                    </div>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <Check size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <div style={styles.featureTitle}>Easy to Use</div>
                    <div style={styles.featureDescription}>
                      Get codes instantly from your authenticator app
                    </div>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <Info size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <div style={styles.featureTitle}>Backup Codes</div>
                    <div style={styles.featureDescription}>
                      Receive backup codes in case you lose access to your device
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.buttonContainer}>
                <button
                  onClick={onClose}
                  style={styles.secondaryButton}
                  className="clickable"
                >
                  Cancel
                </button>
                <button
                  onClick={startSetup}
                  disabled={isLoading}
                  style={{
                    ...styles.primaryButton,
                    ...(isLoading ? styles.buttonDisabled : {}),
                  }}
                  className="clickable"
                >
                  {isLoading ? 'Loading...' : 'Get Started'}
                  {!isLoading && <ChevronRight size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: QR Code Scan */}
          {currentStep === 2 && (
            <div style={styles.stepContent}>
              <p style={styles.description}>
                Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator,
                etc.) and scan this QR code.
              </p>

              {/* QR Code Display */}
              <div style={styles.qrContainer}>
                <QRCodeSVG
                  value={qrCode}
                  size={256}
                  level="H"
                  includeMargin={true}
                  fgColor="#1f2937"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'/%3E%3C/svg%3E",
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              </div>

              {/* Manual Entry Option */}
              <div style={styles.manualEntry}>
                <div style={styles.manualEntryHeader}>
                  <Info size={18} style={{ color: '#3b82f6' }} />
                  <span style={styles.manualEntryTitle}>Can't scan? Enter this code manually:</span>
                </div>
                <div style={styles.secretContainer}>
                  <code style={styles.secretCode}>{secret}</code>
                  <button
                    onClick={copySecretKey}
                    style={styles.copyButton}
                    className="clickable"
                  >
                    {copiedSecret ? <Check size={20} style={{ color: '#10b981' }} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* Supported Apps */}
              <div style={styles.appsSection}>
                <p style={styles.appsSectionTitle}>Recommended apps:</p>
                <div style={styles.appsGrid}>
                  {['Google Authenticator', 'Authy', 'Microsoft Authenticator', '1Password'].map((app) => (
                    <div key={app} style={styles.appBadge}>
                      {app}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.buttonContainer}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={styles.secondaryButton}
                  className="clickable"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
                <button
                  onClick={proceedToVerification}
                  style={styles.primaryButton}
                  className="clickable"
                >
                  I've scanned the code
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verify Code */}
          {currentStep === 3 && (
            <div style={styles.stepContent}>
              <p style={styles.description}>
                Enter the 6-digit code from your authenticator app to verify the setup.
              </p>

              <div style={styles.codeInputContainer}>
                <label style={styles.label}>Authentication Code</label>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength="6"
                  style={{
                    ...styles.codeInput,
                    ...(verificationError ? styles.codeInputError : {}),
                  }}
                />
                {verificationError && (
                  <div style={styles.errorMessage}>
                    <AlertTriangle size={16} />
                    {verificationError}
                  </div>
                )}
                {isLoading && (
                  <div style={styles.loadingMessage}>
                    Verifying...
                  </div>
                )}
              </div>

              <div style={styles.infoBox}>
                <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <span style={styles.infoText}>
                  The code will automatically verify when you enter all 6 digits.
                </span>
              </div>

              <div style={styles.buttonContainer}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={styles.secondaryButton}
                  className="clickable"
                  disabled={isLoading}
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
                <button
                  onClick={verifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  style={{
                    ...styles.primaryButton,
                    ...(isLoading || verificationCode.length !== 6 ? styles.buttonDisabled : {}),
                  }}
                  className="clickable"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Backup Codes */}
          {currentStep === 4 && (
            <div style={styles.stepContent}>
              {/* Warning Message */}
              <div style={styles.warningBox}>
                <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <div style={styles.warningTitle}>Important!</div>
                  <div style={styles.warningText}>
                    Store these codes safely. Each code can only be used once. You won't be able
                    to see them again unless you regenerate them (which will invalidate these codes).
                  </div>
                </div>
              </div>

              {/* Backup Codes Grid */}
              <div style={styles.backupCodesContainer}>
                <div style={styles.backupCodesGrid}>
                  {backupCodes.map((code, index) => (
                    <div key={index} style={styles.backupCode}>
                      {code}
                    </div>
                  ))}
                </div>

                {/* Download and Copy Buttons */}
                <div style={styles.backupCodesActions}>
                  <button
                    onClick={downloadBackupCodes}
                    style={styles.backupActionButton}
                    className="clickable"
                  >
                    <Download size={18} />
                    Download Codes
                  </button>
                  <button
                    onClick={copyBackupCodes}
                    style={styles.backupActionButton}
                    className="clickable"
                  >
                    {copiedBackupCodes ? (
                      <>
                        <Check size={18} style={{ color: '#10b981' }} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy All
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <label style={styles.checkboxLabel} className="clickable">
                <input
                  type="checkbox"
                  checked={confirmationChecked}
                  onChange={(e) => setConfirmationChecked(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>
                  I confirm I have saved these codes in a secure location
                </span>
              </label>

              <button
                onClick={completeSetup}
                disabled={!confirmationChecked}
                style={{
                  ...styles.completeButton,
                  ...(!confirmationChecked ? styles.buttonDisabled : {}),
                }}
                className="clickable"
              >
                <Check size={20} />
                I've saved my codes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles function
const getStyles = (darkMode) => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: '20px',
    padding: 0,
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    color: darkMode ? '#e5e7eb' : '#1f2937',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
    color: darkMode ? '#ffffff' : '#1f2937',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    color: darkMode ? '#9ca3af' : '#6b7280',
    transition: 'all 0.2s',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem 2rem 0',
  },
  progressStep: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: darkMode ? '#374151' : '#e5e7eb',
    color: darkMode ? '#9ca3af' : '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.3s',
  },
  progressStepActive: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  progressLine: {
    flex: 1,
    height: '2px',
    backgroundColor: darkMode ? '#374151' : '#e5e7eb',
    transition: 'all 0.3s',
  },
  progressLineActive: {
    backgroundColor: '#10b981',
  },
  stepIndicator: {
    textAlign: 'center',
    padding: '0.5rem 2rem 0',
    fontSize: '0.875rem',
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontWeight: '500',
  },
  content: {
    padding: '2rem',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    textAlign: 'center',
    margin: '0 0 0.5rem 0',
    color: darkMode ? '#ffffff' : '#1f2937',
  },
  description: {
    fontSize: '0.95rem',
    color: darkMode ? '#d1d5db' : '#4b5563',
    lineHeight: '1.6',
    margin: 0,
    textAlign: 'center',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  featureItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: darkMode ? '#374151' : '#f9fafb',
    borderRadius: '12px',
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
    color: darkMode ? '#ffffff' : '#1f2937',
  },
  featureDescription: {
    fontSize: '0.875rem',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  qrContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  manualEntry: {
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
    borderRadius: '12px',
    padding: '1rem',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
  },
  manualEntryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  manualEntryTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: darkMode ? '#ffffff' : '#1f2937',
  },
  secretContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  secretCode: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    color: '#10b981',
    wordBreak: 'break-all',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
  },
  copyButton: {
    padding: '0.75rem',
    backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: darkMode ? '#ffffff' : '#1f2937',
    transition: 'all 0.2s',
  },
  appsSection: {
    marginTop: '0.5rem',
  },
  appsSectionTitle: {
    fontSize: '0.875rem',
    color: darkMode ? '#9ca3af' : '#6b7280',
    marginBottom: '0.75rem',
    fontWeight: '500',
  },
  appsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  appBadge: {
    padding: '0.5rem 0.75rem',
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
    borderRadius: '8px',
    fontSize: '0.875rem',
    textAlign: 'center',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
    color: darkMode ? '#d1d5db' : '#4b5563',
  },
  codeInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: darkMode ? '#d1d5db' : '#374151',
  },
  codeInput: {
    padding: '1rem',
    fontSize: '2rem',
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: '0.5rem',
    borderRadius: '12px',
    border: darkMode ? '2px solid #4b5563' : '2px solid #e5e7eb',
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    color: darkMode ? '#ffffff' : '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  codeInputError: {
    borderColor: '#ef4444',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  loadingMessage: {
    textAlign: 'center',
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontSize: '0.875rem',
  },
  infoBox: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: darkMode ? '#1e3a5f' : '#eff6ff',
    borderRadius: '12px',
    border: darkMode ? '1px solid #3b82f6' : '1px solid #bfdbfe',
  },
  infoText: {
    fontSize: '0.875rem',
    color: darkMode ? '#bfdbfe' : '#1e40af',
  },
  warningBox: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: darkMode ? '#451a03' : '#fffbeb',
    borderRadius: '12px',
    border: darkMode ? '1px solid #f59e0b' : '1px solid #fde68a',
  },
  warningTitle: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: darkMode ? '#fbbf24' : '#92400e',
    marginBottom: '0.25rem',
  },
  warningText: {
    fontSize: '0.875rem',
    color: darkMode ? '#fde68a' : '#78350f',
    lineHeight: '1.5',
  },
  backupCodesContainer: {
    backgroundColor: darkMode ? '#374151' : '#f9fafb',
    borderRadius: '12px',
    padding: '1.5rem',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
  },
  backupCodesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  backupCode: {
    padding: '0.75rem',
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    textAlign: 'center',
    color: '#10b981',
    fontWeight: '600',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
  },
  backupCodesActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  backupActionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: darkMode ? '#ffffff' : '#1f2937',
    transition: 'all 0.2s',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: darkMode ? '#374151' : '#f9fafb',
    borderRadius: '12px',
    cursor: 'pointer',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#10b981',
  },
  checkboxText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: darkMode ? '#d1d5db' : '#374151',
  },
  buttonContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
    color: darkMode ? '#ffffff' : '#1f2937',
    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  completeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export default TwoFactorSetup;
