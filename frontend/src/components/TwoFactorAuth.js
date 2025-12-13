import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  Smartphone,
  Key,
  Download,
  Copy,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Lock,
  Unlock,
  Info,
} from 'lucide-react';
import axios from 'axios';

const TwoFactorAuth = () => {
  // State management
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Setup flow state
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);

  // Form state
  const [disablePassword, setDisablePassword] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI state
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Check 2FA status on component mount
  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await axios.get('/api/auth/2fa-status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setIs2FAEnabled(response.data.enabled);
      setRemainingBackupCodes(response.data.remainingBackupCodes || 0);
      setSmsEnabled(response.data.smsEnabled || false);
      setPhoneNumber(response.data.phoneNumber || '');
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Start 2FA setup process
  const startSetup = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/setup-2fa',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setQrCodeUrl(response.data.qrCodeUrl);
      setSecretKey(response.data.secret);
      setShowSetupModal(true);
      setCurrentStep(1);
      showMessage('success', 'QR code generated successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA code
  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      showMessage('error', 'Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/verify-2fa',
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setBackupCodes(response.data.backupCodes);
      setCurrentStep(3);
      showMessage('success', '2FA enabled successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete setup
  const completeSetup = () => {
    setIs2FAEnabled(true);
    setShowSetupModal(false);
    setCurrentStep(1);
    setVerificationCode('');
    setRemainingBackupCodes(backupCodes.length);
    showMessage('success', '2FA is now active on your account');
  };

  // Disable 2FA
  const disableTwoFactor = async () => {
    if (!disablePassword) {
      showMessage('error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        '/api/auth/disable-2fa',
        { password: disablePassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setIs2FAEnabled(false);
      setShowDisableModal(false);
      setDisablePassword('');
      showMessage('success', '2FA has been disabled');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  // Get backup codes
  const getBackupCodes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/auth/backup-codes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setBackupCodes(response.data.backupCodes);
      setRemainingBackupCodes(response.data.backupCodes.length);
      setShowBackupCodesModal(true);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to fetch backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    if (!window.confirm('This will invalidate all existing backup codes. Continue?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/regenerate-codes',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setBackupCodes(response.data.backupCodes);
      setRemainingBackupCodes(response.data.backupCodes.length);
      showMessage('success', 'Backup codes regenerated successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('success', 'Backup codes downloaded');
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showMessage('success', 'Backup codes copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy secret key
  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey).then(() => {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    });
  };

  // Send test SMS
  const sendTestSMS = async () => {
    if (!phoneNumber) {
      showMessage('error', 'Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        '/api/auth/send-test-sms',
        { phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      showMessage('success', 'Test SMS sent successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to send test SMS');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle SMS backup
  const toggleSMSBackup = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        '/api/auth/toggle-sms-backup',
        { enabled: !smsEnabled, phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setSmsEnabled(!smsEnabled);
      showMessage('success', `SMS backup ${!smsEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to toggle SMS backup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-400">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                : 'bg-red-900/30 border border-red-500/50 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`p-3 rounded-lg ${
                is2FAEnabled ? 'bg-green-500/20' : 'bg-gray-700'
              }`}
            >
              <Shield
                className={`w-8 h-8 ${
                  is2FAEnabled ? 'text-green-500' : 'text-gray-400'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-white">
                  Two-Factor Authentication
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    is2FAEnabled
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {is2FAEnabled ? (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Disabled
                    </span>
                  )}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {is2FAEnabled
                  ? 'Your account is protected with two-factor authentication using an authenticator app.'
                  : 'Protect your account by requiring a code from your authenticator app when you sign in.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!is2FAEnabled ? (
              <button
                onClick={startSetup}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Enable Two-Factor Auth
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowDisableModal(true)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Disable 2FA
                </button>
                <button
                  onClick={getBackupCodes}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Key className="w-5 h-5" />
                  View Backup Codes ({remainingBackupCodes})
                </button>
              </>
            )}
          </div>
        </div>

        {/* SMS Backup Option */}
        {is2FAEnabled && (
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gray-700">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  SMS Backup (Optional)
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add your phone number to receive backup codes via SMS if you lose access to
                  your authenticator app.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 flex-1 min-w-[200px]"
                  />
                  <button
                    onClick={toggleSMSBackup}
                    disabled={isLoading || !phoneNumber}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      smsEnabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {smsEnabled ? 'Disable SMS' : 'Enable SMS'}
                  </button>
                  {smsEnabled && (
                    <button
                      onClick={sendTestSMS}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Test SMS
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Enable Two-Factor Authentication
                  </h2>
                  <button
                    onClick={() => setShowSetupModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                {/* Progress Steps */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                          currentStep >= step
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`flex-1 h-1 rounded ${
                            currentStep > step ? 'bg-green-600' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Step 1: QR Code */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Step 1: Scan QR Code
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Use an authenticator app like Google Authenticator, Authy, or 1Password
                        to scan this QR code.
                      </p>
                    </div>

                    {/* QR Code Display */}
                    <div className="flex justify-center p-6 bg-white rounded-lg">
                      <QRCodeSVG value={qrCodeUrl} size={200} level="H" />
                    </div>

                    {/* Manual Entry */}
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">
                          Can't scan the QR code?
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Enter this secret key manually into your authenticator app:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-900 rounded text-green-400 font-mono text-sm break-all">
                          {secretKey}
                        </code>
                        <button
                          onClick={copySecretKey}
                          className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                        >
                          {copiedSecret ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Supported Apps */}
                    <div>
                      <p className="text-sm text-gray-400 mb-3">Recommended apps:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          'Google Authenticator',
                          'Authy',
                          'Microsoft Authenticator',
                          '1Password',
                        ].map((app) => (
                          <div
                            key={app}
                            className="px-3 py-2 bg-gray-700/50 rounded border border-gray-600 text-sm text-gray-300 text-center"
                          >
                            {app}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Step 2: Verify Code */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Step 2: Verify Code
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Enter the 6-digit code from your authenticator app to verify the setup.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Authentication Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        placeholder="000000"
                        maxLength="6"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-green-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                      </button>
                      <button
                        onClick={verifyCode}
                        disabled={isLoading || verificationCode.length !== 6}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Backup Codes */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Step 3: Save Backup Codes
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Save these backup codes in a safe place. Each code can be used once if
                        you lose access to your authenticator app.
                      </p>
                    </div>

                    {/* Backup Codes Grid */}
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {backupCodes.map((code, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-gray-900 rounded font-mono text-sm text-green-400 text-center"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={downloadBackupCodes}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={copyBackupCodes}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-yellow-400 font-medium mb-1">Important:</p>
                        <p className="text-yellow-200">
                          Store these codes securely. You won't be able to see them again unless
                          you regenerate them (which will invalidate the old ones).
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={completeSetup}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Complete Setup
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Disable 2FA Modal */}
        {showDisableModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Disable Two-Factor Authentication</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="text-sm text-red-200">
                    Disabling 2FA will make your account less secure. Are you sure you want to
                    continue?
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDisableModal(false);
                      setDisablePassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={disableTwoFactor}
                    disabled={isLoading || !disablePassword}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes Modal */}
        {showBackupCodesModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Backup Codes</h2>
                  <button
                    onClick={() => setShowBackupCodesModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-400 text-sm">
                  You have {remainingBackupCodes} backup codes remaining. Each code can be used
                  once.
                </p>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-gray-900 rounded font-mono text-sm text-green-400 text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadBackupCodes}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={copyBackupCodes}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={regenerateBackupCodes}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Backup Codes
                </button>
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div className="text-sm text-yellow-200">
                    Regenerating backup codes will invalidate all existing codes. Make sure to
                    save the new codes securely.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;
