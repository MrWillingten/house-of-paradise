import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../services/api';
import {
  User, Mail, Lock, Shield, Phone, Trash2, AlertCircle, Check, X,
  Loader, Edit2, Key, Smartphone, QrCode, Copy, Eye, EyeOff, Globe, ChevronDown, Search, Download
} from 'lucide-react';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { countries, validatePhoneNumber } from '../utils/countries';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return savedUser.darkMode || false;
  });

  // Display Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [nameError, setNameError] = useState('');

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Phone Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.code === '+1') || countries[0]
  );
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [showRemovePhoneModal, setShowRemovePhoneModal] = useState(false);
  const [removePhonePassword, setRemovePhonePassword] = useState('');
  const countryDropdownRef = useRef(null);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupCodesInfo, setBackupCodesInfo] = useState(null); // Info about backup codes (used/available, regeneration date)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState('');
  const [regenerateError, setRegenerateError] = useState('');
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [showRemove2FAModal, setShowRemove2FAModal] = useState(false);
  const [remove2FAPassword, setRemove2FAPassword] = useState('');

  // SMS Backup Auth State
  const [smsBackupEnabled, setSmsBackupEnabled] = useState(false);

  // Account Actions State
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountActionPassword, setAccountActionPassword] = useState('');
  const [accountActionError, setAccountActionError] = useState('');

  // Success Banner State
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCountryDropdown]);

  const fetchUserData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    setDisplayName(currentUser.name || '');
    setLoading(false);
  };

  const handleProfileImageChange = async (file, preview) => {
    try {
      // If file is null, this is a removal request
      if (file === null) {
        const response = await api.delete('/api/auth/delete-profile-image');

        // Update user to remove the profileImage
        const updatedUser = { ...user, profileImage: null };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('profileImageUpdated'));
        showSuccess('Profile picture removed successfully!');
        return;
      }

      // Upload image to backend using axios with auto token refresh
      const formData = new FormData();
      formData.append('profileImage', file);

      // Use native fetch for file uploads to avoid axios Content-Type header issues
      // This ensures the browser sets the correct multipart/form-data boundary
      const token = localStorage.getItem('accessToken');
      const fetchResponse = await fetch(`${API_BASE_URL}/api/auth/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // DO NOT set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const response = { data: await fetchResponse.json() };

      // Update user with the backend image URL
      const updatedUser = { ...user, profileImage: response.data.data.imageUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('profileImageUpdated'));
      showSuccess('Profile picture updated successfully!');
    } catch (error) {
      console.error('Profile image operation error:', error);
      showError(error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to process profile image');
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessBanner(true);
    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 10000);
  };

  const showError = (message) => {
    // For now, just log the error. You can add an error banner similar to success banner
    console.error('Error:', message);
    alert(message); // Simple alert for errors
  };

  // Display Name Handlers
  const handleEditName = () => {
    setIsEditingName(true);
    setNameError('');
  };

  const handleSaveName = async () => {
    // Validate: letters and spaces only
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(displayName)) {
      setNameError('Display name can only contain letters and spaces');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/update-display-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName: displayName.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update display name');
      }

      // Update local state and localStorage with the new name
      const updatedUser = { ...user, name: displayName.trim() };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingName(false);
      setNameError('');
      showSuccess('Display name updated successfully!');
    } catch (error) {
      setNameError(error.message || 'Failed to update display name. Please try again.');
    }
  };

  // Email Handlers
  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const response = await api.post('/api/auth/request-email-change', { newEmail, password: emailPassword });

      setShowEmailVerification(true);
      showSuccess('Verification code sent to your current email address!');
    } catch (error) {
      setEmailError(error.response?.data?.message || error.message || 'Failed to change email. Please check your password and try again.');
    }
  };

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    setEmailError('');

    try {
      const response = await api.post('/api/auth/verify-email-change', { code: verificationCode });

      const updatedUser = { ...user, email: newEmail };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowEmailModal(false);
      setShowEmailVerification(false);
      setNewEmail('');
      setEmailPassword('');
      setVerificationCode('');
      showSuccess('Email address updated successfully!');
    } catch (error) {
      setEmailError(error.response?.data?.message || error.message || 'Invalid code. Please try again.');
    }
  };

  // Phone Handlers
  const handleAddPhone = async (e) => {
    e.preventDefault();
    setPhoneError('');

    // Use country-specific validation
    const validation = validatePhoneNumber(phoneNumber, selectedCountry);
    if (!validation.valid) {
      setPhoneError(validation.error);
      return;
    }

    try {
      // Call API to add phone and send verification code
      const response = await api.post('/api/auth/add-phone', {
        phone: validation.normalizedNumber,
        countryCode: selectedCountry.code
      });

      if (response.data.success) {
        setShowPhoneVerification(true);
        showSuccess('Verification code sent to your phone!');
      } else {
        setPhoneError(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      setPhoneError(error.response?.data?.message || 'Failed to add phone number. Please try again.');
    }
  };

  const handlePhoneVerification = async (e) => {
    e.preventDefault();
    setPhoneError('');

    try {
      // Call API to verify phone
      const response = await api.post('/api/auth/verify-phone', {
        code: phoneVerificationCode
      });

      if (response.data.success) {
        const validation = validatePhoneNumber(phoneNumber, selectedCountry);
        const updatedUser = {
          ...user,
          phone: validation.normalizedNumber,
          phoneCountryCode: selectedCountry.code
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowPhoneModal(false);
        setShowPhoneVerification(false);
        setPhoneNumber('');
        setPhoneVerificationCode('');
        showSuccess('Phone number added successfully!');
      } else {
        setPhoneError(response.data.message || 'Invalid verification code');
      }
    } catch (error) {
      setPhoneError(error.response?.data?.message || 'Invalid code. Please try again.');
    }
  };

  const handleRemovePhone = async (e) => {
    e.preventDefault();

    try {
      // TODO: API call
      // await fetch('/api/auth/remove-phone', {
      //   method: 'DELETE',
      //   body: JSON.stringify({ password: removePhonePassword })
      // });

      const updatedUser = { ...user, phone: null };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowRemovePhoneModal(false);
      setRemovePhonePassword('');
      showSuccess('Phone number removed successfully!');
    } catch (error) {
      setPhoneError('Failed to remove phone. Please check your password.');
    }
  };

  // Password Validation
  const passwordValidation = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    };
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!isPasswordValid) {
      setPasswordError('Password does not meet requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      // TODO: API call
      // await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ currentPassword, newPassword })
      // });

      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password changed successfully!');
    } catch (error) {
      setPasswordError('Failed to change password. Please check your current password.');
    }
  };

  // 2FA Handlers
  const handleEnable2FA = async () => {
    console.log('🔐 Enable 2FA clicked');
    try {
      console.log('📡 Calling enable-2fa API...');

      const response = await api.post('/api/auth/enable-2fa', {});
      console.log('📥 API Response:', response.data);

      // Set the QR code data URL from backend
      console.log('✅ Setting QR code and secret');
      setQrCode(response.data.data.qrCodeDataUrl);
      setTwoFactorSecret(response.data.data.secret);
      setShow2FAModal(true);
      console.log('✅ Modal should now be visible');
    } catch (error) {
      console.error('❌ Enable 2FA error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate QR code. Please try again.';
      setTwoFactorError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError('');

    try {
      const response = await api.post('/api/auth/verify-2fa-setup', { code: twoFactorCode });

      // Set backup codes from API response
      setBackupCodes(response.data.data.backupCodes);

      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShow2FAModal(false);
      setTwoFactorCode('');
      setShowBackupCodes(true);  // Show backup codes modal
      showSuccess('Two-factor authentication enabled successfully!');
    } catch (error) {
      setTwoFactorError(error.response?.data?.message || error.message || 'Invalid code. Please try again.');
    }
  };

  const handleRemove2FA = async (e) => {
    e.preventDefault();

    try {
      // TODO: API call
      // await fetch('/api/auth/disable-2fa', {
      //   method: 'POST',
      //   body: JSON.stringify({ password: remove2FAPassword })
      // });

      const updatedUser = { ...user, twoFactorEnabled: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowRemove2FAModal(false);
      setRemove2FAPassword('');
      showSuccess('Two-factor authentication disabled');
    } catch (error) {
      setTwoFactorError('Failed to disable 2FA. Please check your password.');
    }
  };

  const handleViewBackupCodes = async () => {
    try {
      const response = await api.get('/api/auth/backup-codes');
      setBackupCodesInfo(response.data.data);
      setBackupCodes([]); // Clear any previous codes - we only show metadata now
      setShowBackupCodes(true);
    } catch (error) {
      setTwoFactorError('Failed to fetch backup codes info.');
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!regeneratePassword) {
      setRegenerateError('Password is required');
      return;
    }

    setRegenerateLoading(true);
    setRegenerateError('');

    try {
      const response = await api.post('/api/auth/regenerate-backup-codes', {
        password: regeneratePassword
      });

      // Show the new backup codes in the backup codes modal
      setBackupCodes(response.data.data.backupCodes);
      setBackupCodesInfo({
        ...backupCodesInfo,
        generatedAt: response.data.data.generatedAt,
        nextRegenerationDate: response.data.data.nextRegenerationDate,
        canRegenerate: false,
        totalCodes: 10,
        usedCodes: 0,
        availableCodes: 10
      });
      setShowRegenerateModal(false);
      setRegeneratePassword('');
      setShowBackupCodes(true); // Show the backup codes modal with new codes
    } catch (error) {
      if (error.response?.status === 429) {
        setRegenerateError(error.response.data.message);
      } else {
        setRegenerateError(error.response?.data?.message || 'Failed to regenerate backup codes');
      }
    } finally {
      setRegenerateLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const timestamp = new Date().toLocaleString();

    const fileContent = `House of Paradise - Two-Factor Authentication Backup Codes
Generated: ${timestamp}
Account: ${user.email || 'Unknown'}

IMPORTANT: Store these codes safely. Each code can only be used once.
If you lose access to your authenticator app, you can use these codes to sign in.

Backup Codes:
${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Keep these codes in a secure location (password manager, safe, etc.).
Do NOT share these codes with anyone.
`;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HoP-2FA-Backup-Codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess('Backup codes downloaded successfully!');
  };

  // Account Action Handlers
  const handleDisableAccount = async (e) => {
    e.preventDefault();
    setAccountActionError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/disable-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: accountActionPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to disable account');
      }

      // Account disabled successfully - clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      setAccountActionError(error.message || 'Failed to disable account. Please check your password.');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setAccountActionError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: accountActionPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      // Account deleted successfully - clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      setAccountActionError(error.message || 'Failed to delete account. Please check your password.');
    }
  };


  if (loading) {
    return (
      <div style={{
        ...styles.loading,
        background: darkMode ? '#0a0a0a' : '#f9fafb'
      }}>
        <Loader size={48} style={styles.spinner} className="spinner-icon" color="#10b981" />
        <p style={{
          ...styles.loadingText,
          color: darkMode ? '#9ca3af' : '#6b7280'
        }}>
          Loading account settings...
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{accountStyles}</style>

      <div style={{
        ...styles.container,
        background: darkMode ? '#0a0a0a' : '#f9fafb'
      }}>
        {/* Success Banner */}
        {showSuccessBanner && (
          <div style={{
            ...styles.successBanner,
            background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
            border: `2px solid ${darkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
          }} className="success-banner">
            <div style={styles.successBannerContent}>
              <Check size={20} color="#10b981" />
              <span style={{ color: darkMode ? '#6ee7b7' : '#059669' }}>
                {successMessage}
              </span>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              style={styles.successBannerClose}
            >
              <X size={18} color={darkMode ? '#6ee7b7' : '#059669'} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={{
            ...styles.card,
            background: darkMode ? '#1a1a2e' : '#ffffff',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
          }}>
            {/* Header */}
            <div style={styles.cardHeader}>
              <h1 style={{
                ...styles.cardTitle,
                color: darkMode ? '#ffffff' : '#1f2937'
              }}>
                My Account
              </h1>
              <p style={{
                ...styles.cardSubtitle,
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Manage your account settings and preferences
              </p>
            </div>

            <div style={styles.cardBody}>
              {/* 1. Profile Image Upload */}
              <div style={styles.section}>
                <ProfileImageUpload
                  currentImage={user?.profileImage}
                  onImageChange={handleProfileImageChange}
                  darkMode={darkMode}
                />
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 2. Display Name */}
              <div style={styles.section}>
                <label style={{
                  ...styles.fieldLabel,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  DISPLAY NAME
                </label>
                <div style={styles.fieldRow}>
                  {!isEditingName ? (
                    <>
                      <span style={{
                        ...styles.fieldValue,
                        color: darkMode ? '#e5e7eb' : '#1f2937'
                      }}>
                        {displayName}
                      </span>
                      <button
                        onClick={handleEditName}
                        style={{
                          ...styles.editButton,
                          background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981'
                        }}
                        className="action-button"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <div style={styles.editRow}>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          setNameError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${nameError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`
                        }}
                        placeholder="Enter display name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        style={{
                          ...styles.saveButton,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}
                        className="action-button"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                {nameError && (
                  <div style={styles.errorText}>
                    <X size={16} color="#ef4444" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 3. Email */}
              <div style={styles.section}>
                <label style={{
                  ...styles.fieldLabel,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  EMAIL
                </label>
                <div style={styles.fieldRow}>
                  <span style={{
                    ...styles.fieldValue,
                    color: darkMode ? '#e5e7eb' : '#1f2937'
                  }}>
                    {user?.email}
                  </span>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    style={{
                      ...styles.editButton,
                      background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981'
                    }}
                    className="action-button"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 4. Phone Number */}
              <div style={styles.section}>
                <label style={{
                  ...styles.fieldLabel,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  PHONE NUMBER
                </label>
                <div style={styles.fieldRow}>
                  <span style={{
                    ...styles.fieldValue,
                    color: darkMode ? '#e5e7eb' : '#1f2937'
                  }}>
                    {user?.phone ? user.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : 'Not provided'}
                  </span>
                  {!user?.phone ? (
                    <button
                      onClick={() => setShowPhoneModal(true)}
                      style={{
                        ...styles.editButton,
                        background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981'
                      }}
                      className="action-button"
                    >
                      Add
                    </button>
                  ) : (
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => setShowPhoneModal(true)}
                        style={{
                          ...styles.editButton,
                          background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981'
                        }}
                        className="action-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowRemovePhoneModal(true)}
                        style={{
                          ...styles.removeButton,
                          background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444'
                        }}
                        className="action-button"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 5. Password and Authentication Section */}
              <div style={styles.section}>
                <h2 style={{
                  ...styles.sectionHeader,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Password and Authentication
                </h2>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    ...styles.actionButton,
                    background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: `2px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
                  }}
                  className="action-button"
                >
                  <Key size={18} />
                  <span>Change Password</span>
                </button>
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 6. Authenticator App (2FA) */}
              <div style={styles.section}>
                <div style={styles.twoFactorHeader}>
                  <div>
                    <h3 style={{
                      ...styles.subsectionTitle,
                      color: darkMode ? '#ffffff' : '#1f2937'
                    }}>
                      Authenticator App
                    </h3>
                    <p style={{
                      ...styles.subsectionDesc,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Protect your account with two-factor authentication using an authenticator app like Google Authenticator or Authy.
                    </p>
                  </div>
                </div>

                {user?.twoFactorEnabled ? (
                  <div style={styles.twoFactorEnabled}>
                    <div style={{
                      ...styles.badge,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <Shield size={16} color="#10b981" />
                      <span style={{ color: '#10b981' }}>Multi-Factor Authentication enabled</span>
                    </div>
                    <div style={styles.twoFactorActions}>
                      <button
                        onClick={handleViewBackupCodes}
                        style={{
                          ...styles.secondaryButton,
                          background: darkMode ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.1)',
                          color: '#0ea5e9',
                          border: `2px solid ${darkMode ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)'}`
                        }}
                        className="action-button"
                      >
                        <Key size={18} />
                        <span>View Backup Codes</span>
                      </button>
                      <button
                        onClick={() => setShowRemove2FAModal(true)}
                        style={{
                          ...styles.actionButton,
                          background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: `2px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}
                        className="action-button"
                      >
                        <X size={18} />
                        <span>Remove Authenticator App</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleEnable2FA}
                    style={{
                      ...styles.actionButton,
                      background: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      border: `2px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}
                    className="action-button"
                  >
                    <Shield size={18} />
                    <span>Enable Two-Factor Auth</span>
                  </button>
                )}
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 7. SMS Backup Authentication */}
              <div style={styles.section}>
                <div>
                  <h3 style={{
                    ...styles.subsectionTitle,
                    color: darkMode ? '#ffffff' : '#1f2937'
                  }}>
                    SMS Backup Authentication
                  </h3>
                  <p style={{
                    ...styles.subsectionDesc,
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Use SMS as a backup two-factor authentication method. Requires phone number.
                  </p>
                </div>

                {!user?.phone ? (
                  <div style={{
                    ...styles.warningBox,
                    background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}>
                    <AlertCircle size={20} color="#f59e0b" />
                    <span style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>
                      Add a phone number to enable SMS backup authentication
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSmsBackupEnabled(!smsBackupEnabled)}
                    style={{
                      ...styles.actionButton,
                      background: smsBackupEnabled
                        ? darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
                        : darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                      color: smsBackupEnabled ? '#ef4444' : '#10b981',
                      border: `2px solid ${smsBackupEnabled
                        ? darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
                        : darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
                    }}
                    className="action-button"
                  >
                    <Smartphone size={18} />
                    <span>{smsBackupEnabled ? 'Disable SMS Backup' : 'Enable SMS Backup'}</span>
                  </button>
                )}
              </div>

              <div style={{
                ...styles.divider,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }} />

              {/* 8. Account Removal */}
              <div style={styles.section}>
                <h2 style={{
                  ...styles.sectionHeader,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Account Removal
                </h2>
                <div style={styles.dangerZone}>
                  <button
                    onClick={() => setShowDisableModal(true)}
                    style={{
                      ...styles.actionButton,
                      background: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      border: `2px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}
                    className="action-button"
                  >
                    <AlertCircle size={18} />
                    <span>Disable Account</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      ...styles.actionButton,
                      background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: `2px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                    className="action-button"
                  >
                    <Trash2 size={18} />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Change Modal */}
        {showEmailModal && (
          <div style={styles.modalOverlay} onClick={() => {
            if (!showEmailVerification) {
              setShowEmailModal(false);
              setNewEmail('');
              setEmailPassword('');
              setEmailError('');
            }
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  {showEmailVerification ? 'Verify New Email' : 'Change Email Address'}
                </h2>
                <button
                  onClick={() => {
                    if (!showEmailVerification) {
                      setShowEmailModal(false);
                      setNewEmail('');
                      setEmailPassword('');
                      setEmailError('');
                    }
                  }}
                  style={styles.modalClose}
                  disabled={showEmailVerification}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                {!showEmailVerification ? (
                  <form onSubmit={handleEmailChange}>
                    <div style={styles.formGroup}>
                      <label style={{
                        ...styles.label,
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          setEmailError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${emailError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`
                        }}
                        placeholder="your.new.email@example.com"
                        autoFocus
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={{
                        ...styles.label,
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={(e) => {
                          setEmailPassword(e.target.value);
                          setEmailError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${emailError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`
                        }}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {emailError && (
                      <div style={styles.errorText}>
                        <X size={16} color="#ef4444" />
                        <span>{emailError}</span>
                      </div>
                    )}

                    <div style={{
                      ...styles.infoBox,
                      background: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)'}`
                    }}>
                      <AlertCircle size={18} color="#0ea5e9" />
                      <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        We'll send a verification code to {user?.email} to confirm it's you
                      </span>
                    </div>

                    <button
                      type="submit"
                      style={{
                        ...styles.submitButton,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                      className="action-button"
                    >
                      Send Verification Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailVerification}>
                    <div style={styles.formGroup}>
                      <label style={{
                        ...styles.label,
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(e.target.value);
                          setEmailError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${emailError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                          fontSize: '1.5rem',
                          textAlign: 'center',
                          letterSpacing: '0.5rem'
                        }}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        required
                      />
                    </div>

                    {emailError && (
                      <div style={styles.errorText}>
                        <X size={16} color="#ef4444" />
                        <span>{emailError}</span>
                      </div>
                    )}

                    <div style={{
                      ...styles.infoBox,
                      background: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)'}`
                    }}>
                      <AlertCircle size={18} color="#0ea5e9" />
                      <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        Enter the 6-digit code sent to {user?.email}
                      </span>
                    </div>

                    <button
                      type="submit"
                      style={{
                        ...styles.submitButton,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                      className="action-button"
                    >
                      Verify Email
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phone Modal */}
        {showPhoneModal && (
          <div style={styles.modalOverlay} onClick={() => {
            if (!showPhoneVerification) {
              setShowPhoneModal(false);
              setPhoneNumber('');
              setPhoneError('');
              setShowCountryDropdown(false);
            }
          }}>
            <div
              style={{
                ...styles.phoneModal,
                background: darkMode ? '#1e1f22' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.phoneModalHeader}>
                <h2 style={{
                  ...styles.phoneModalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  {showPhoneVerification ? 'Verify Phone Number' : 'Enter a Phone Number'}
                </h2>
                <button
                  onClick={() => {
                    if (!showPhoneVerification) {
                      setShowPhoneModal(false);
                      setPhoneNumber('');
                      setPhoneError('');
                      setShowCountryDropdown(false);
                    }
                  }}
                  style={styles.phoneModalClose}
                  disabled={showPhoneVerification}
                >
                  <X size={20} color={darkMode ? '#b5bac1' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.phoneModalBody}>
                {!showPhoneVerification ? (
                  <form onSubmit={handleAddPhone}>
                    <p style={{
                      ...styles.phoneModalDesc,
                      color: darkMode ? '#b5bac1' : '#6b7280'
                    }}>
                      You will receive a text message with a verification code.
                    </p>

                    <div style={styles.phoneInputRow}>
                      {/* Country Code Dropdown */}
                      <div style={styles.countrySection}>
                        <label style={{
                          ...styles.phoneLabel,
                          color: darkMode ? '#b5bac1' : '#6b7280'
                        }}>
                          Country Code
                        </label>
                        <div style={{ position: 'relative' }} ref={countryDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            style={{
                              ...styles.countryButton,
                              background: darkMode ? '#1e1f22' : '#ffffff',
                              border: `2px solid ${darkMode ? '#383a40' : '#e3e5e8'}`,
                              color: darkMode ? '#ffffff' : '#1f2937'
                            }}
                            className="country-button"
                          >
                            <span style={styles.countryButtonContent}>
                              <span style={styles.countryFlag}>{selectedCountry.flag}</span>
                              <span style={styles.countryIso}>{selectedCountry.iso}</span>
                              <span style={styles.countryName}>{selectedCountry.name}</span>
                            </span>
                            <ChevronDown
                              size={16}
                              color={darkMode ? '#949ba4' : '#5c5e66'}
                              style={{
                                transition: 'transform 0.2s ease',
                                transform: showCountryDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                              }}
                            />
                          </button>

                          {/* Dropdown List */}
                          {showCountryDropdown && (
                            <div
                              style={{
                                ...styles.countryDropdown,
                                background: darkMode ? '#2b2d31' : '#ffffff',
                                border: `1px solid ${darkMode ? '#3f4147' : '#e3e5e8'}`
                              }}
                              className="country-dropdown"
                            >
                              {/* Country List - No Search */}
                              <div style={styles.countryList}>
                                {countries.map((country) => (
                                  <button
                                    key={country.iso}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setShowCountryDropdown(false);
                                    }}
                                    style={{
                                      ...styles.countryItem,
                                      background: selectedCountry.iso === country.iso
                                        ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                                        : 'transparent'
                                    }}
                                    className="country-item"
                                  >
                                    <span style={styles.countryItemContent}>
                                      <span style={styles.countryFlag}>{country.flag}</span>
                                      <span style={{
                                        ...styles.countryItemIso,
                                        color: darkMode ? '#949ba4' : '#5c5e66'
                                      }}>
                                        {country.iso}
                                      </span>
                                      <span style={{
                                        color: darkMode ? '#ffffff' : '#1f2937'
                                      }}>
                                        {country.name}
                                      </span>
                                    </span>
                                    {selectedCountry.iso === country.iso && (
                                      <Check size={16} color="#10b981" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone Number Input */}
                      <div style={styles.phoneSection}>
                        <label style={{
                          ...styles.phoneLabel,
                          color: darkMode ? '#b5bac1' : '#6b7280'
                        }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setPhoneError('');
                          }}
                          style={{
                            ...styles.phoneInput,
                            background: darkMode ? '#1e1f22' : '#ffffff',
                            border: `2px solid ${phoneError ? '#ef4444' : darkMode ? '#383a40' : '#e3e5e8'}`,
                            color: darkMode ? '#ffffff' : '#1f2937'
                          }}
                          placeholder={selectedCountry.code}
                          required
                        />
                      </div>
                    </div>

                    {phoneError && (
                      <div style={styles.errorText}>
                        <X size={16} color="#ef4444" />
                        <span>{phoneError}</span>
                      </div>
                    )}

                    <p style={{
                      ...styles.phoneModalInfo,
                      color: darkMode ? '#949ba4' : '#6b7280'
                    }}>
                      Your phone number can be used to verify one HoP account at a time and is only used for verification and login.
                    </p>

                    <div style={styles.phoneModalActions}>
                      <button
                        type="submit"
                        style={{
                          ...styles.phoneSubmitButton,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        }}
                        className="action-button"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneVerification}>
                    <div style={styles.formGroup}>
                      <label style={{
                        ...styles.label,
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={phoneVerificationCode}
                        onChange={(e) => {
                          setPhoneVerificationCode(e.target.value);
                          setPhoneError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${phoneError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                          fontSize: '1.5rem',
                          textAlign: 'center',
                          letterSpacing: '0.5rem'
                        }}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        required
                      />
                    </div>

                    {phoneError && (
                      <div style={styles.errorText}>
                        <X size={16} color="#ef4444" />
                        <span>{phoneError}</span>
                      </div>
                    )}

                    <div style={{
                      ...styles.infoBox,
                      background: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)'}`
                    }}>
                      <AlertCircle size={18} color="#0ea5e9" />
                      <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        Enter the 6-digit code sent to {selectedCountry.code} {phoneNumber}
                      </span>
                    </div>

                    <button
                      type="submit"
                      style={{
                        ...styles.submitButton,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                      className="action-button"
                    >
                      Verify Phone
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Remove Phone Modal */}
        {showRemovePhoneModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowRemovePhoneModal(false);
            setRemovePhonePassword('');
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Remove Phone Number
                </h2>
                <button
                  onClick={() => {
                    setShowRemovePhoneModal(false);
                    setRemovePhonePassword('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{
                  ...styles.warningBox,
                  background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  <AlertCircle size={20} color="#ef4444" />
                  <span style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                    This will disable SMS backup authentication if enabled
                  </span>
                </div>

                <form onSubmit={handleRemovePhone}>
                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={removePhonePassword}
                      onChange={(e) => setRemovePhonePassword(e.target.value)}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#1f2937',
                        border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`
                      }}
                      placeholder="Enter your password"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    }}
                    className="action-button"
                  >
                    Remove Phone Number
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
          }}>
            <div
              style={{
                ...styles.modal,
                ...styles.largeModal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <form onSubmit={handlePasswordChange}>
                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Current Password
                    </label>
                    <div style={styles.passwordInputWrapper}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${passwordError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                          paddingRight: '3rem'
                        }}
                        placeholder="Enter current password"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={styles.passwordToggle}
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        ) : (
                          <Eye size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      New Password
                    </label>
                    <div style={styles.passwordInputWrapper}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${passwordError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                          paddingRight: '3rem'
                        }}
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={styles.passwordToggle}
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        ) : (
                          <Eye size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        )}
                      </button>
                    </div>

                    {newPassword && (
                      <div style={styles.passwordRequirements}>
                        <div style={styles.requirementItem}>
                          {passwordValidation.minLength ? (
                            <Check size={16} color="#10b981" />
                          ) : (
                            <X size={16} color="#ef4444" />
                          )}
                          <span style={{
                            ...styles.requirementText,
                            color: passwordValidation.minLength ? '#10b981' : darkMode ? '#6b7280' : '#9ca3af'
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
                            color: passwordValidation.hasUppercase ? '#10b981' : darkMode ? '#6b7280' : '#9ca3af'
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
                            color: passwordValidation.hasLowercase ? '#10b981' : darkMode ? '#6b7280' : '#9ca3af'
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
                            color: passwordValidation.hasNumber ? '#10b981' : darkMode ? '#6b7280' : '#9ca3af'
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
                            color: passwordValidation.hasSpecial ? '#10b981' : darkMode ? '#6b7280' : '#9ca3af'
                          }}>
                            One special character (!@#$%^&*)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Confirm New Password
                    </label>
                    <div style={styles.passwordInputWrapper}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError('');
                        }}
                        style={{
                          ...styles.input,
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#1f2937',
                          border: `2px solid ${passwordError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                          paddingRight: '3rem'
                        }}
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.passwordToggle}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        ) : (
                          <Eye size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div style={styles.errorText}>
                      <X size={16} color="#ef4444" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      opacity: (!isPasswordValid || !confirmPassword) ? 0.6 : 1,
                      cursor: (!isPasswordValid || !confirmPassword) ? 'not-allowed' : 'pointer'
                    }}
                    className="action-button"
                    disabled={!isPasswordValid || !confirmPassword}
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Enable 2FA Modal */}
        {show2FAModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShow2FAModal(false);
            setTwoFactorCode('');
            setTwoFactorError('');
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Enable Two-Factor Authentication
                </h2>
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setTwoFactorCode('');
                    setTwoFactorError('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.qrSection}>
                  <p style={{
                    ...styles.instructionText,
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>

                  <div style={styles.qrCodeWrapper}>
                    <div style={{
                      ...styles.qrCodePlaceholder,
                      background: darkMode ? '#0f0f1a' : '#f9fafb',
                      border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`
                    }}>
                      {qrCode ? (
                        <img src={qrCode} alt="QR Code" style={styles.qrCodeImage} />
                      ) : (
                        <QrCode size={200} color={darkMode ? '#9ca3af' : '#6b7280'} />
                      )}
                    </div>
                  </div>

                  {/* Manual Entry Option */}
                  {twoFactorSecret && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                      borderRadius: '12px'
                    }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: darkMode ? '#10b981' : '#059669',
                        marginBottom: '0.75rem'
                      }}>
                        Can't scan? Enter this code manually:
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <code style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: darkMode ? '#0f0f1a' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          color: '#10b981',
                          fontWeight: '600',
                          letterSpacing: '0.1em'
                        }}>
                          {twoFactorSecret}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(twoFactorSecret);
                            showSuccess('Secret key copied to clipboard!');
                          }}
                          style={{
                            padding: '0.75rem',
                            background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                            border: `2px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#10b981'
                          }}
                          className="action-button"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleVerify2FA}>
                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => {
                        setTwoFactorCode(e.target.value);
                        setTwoFactorError('');
                      }}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#1f2937',
                        border: `2px solid ${twoFactorError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                        fontSize: '1.5rem',
                        textAlign: 'center',
                        letterSpacing: '0.5rem'
                      }}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      required
                    />
                  </div>

                  {twoFactorError && (
                    <div style={styles.errorText}>
                      <X size={16} color="#ef4444" />
                      <span>{twoFactorError}</span>
                    </div>
                  )}

                  <div style={{
                    ...styles.infoBox,
                    background: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)',
                    border: `1px solid ${darkMode ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)'}`
                  }}>
                    <AlertCircle size={18} color="#0ea5e9" />
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Enter the 6-digit code from your authenticator app
                    </span>
                  </div>

                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                    className="action-button"
                  >
                    Enable 2FA
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes Modal */}
        {showBackupCodes && (
          <div style={styles.modalOverlay} onClick={() => { setShowBackupCodes(false); setBackupCodes([]); }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                maxWidth: '500px'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Backup Codes
                </h2>
                <button
                  onClick={() => { setShowBackupCodes(false); setBackupCodes([]); }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                {/* Show newly generated codes if available */}
                {backupCodes.length > 0 ? (
                  <>
                    <div style={{
                      ...styles.warningBox,
                      background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
                    }}>
                      <Check size={20} color="#10b981" />
                      <span style={{ color: darkMode ? '#34d399' : '#059669' }}>
                        New backup codes generated! Save these codes securely - they will only be shown once.
                      </span>
                    </div>

                    <div style={{
                      ...styles.backupCodesGrid,
                      background: darkMode ? '#0f0f1a' : '#f9fafb',
                      border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`
                    }}>
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          style={{
                            ...styles.backupCode,
                            color: darkMode ? '#e5e7eb' : '#1f2937'
                          }}
                        >
                          {code}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={downloadBackupCodes}
                      style={{
                        ...styles.submitButton,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                      className="action-button"
                    >
                      <Download size={18} />
                      <span>Download Codes</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Show backup codes info and status */}
                    <div style={{
                      ...styles.warningBox,
                      background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}>
                      <AlertCircle size={20} color="#f59e0b" />
                      <span style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>
                        Backup codes are only shown once when generated. If you've lost them, you can regenerate new codes below.
                      </span>
                    </div>

                    {backupCodesInfo && (
                      <div style={{
                        padding: '1.5rem',
                        background: darkMode ? '#0f0f1a' : '#f9fafb',
                        borderRadius: '12px',
                        border: `1px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`,
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Total Codes:</span>
                          <span style={{ color: darkMode ? '#e5e7eb' : '#1f2937', fontWeight: '600' }}>{backupCodesInfo.totalCodes}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Available:</span>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>{backupCodesInfo.availableCodes}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Used:</span>
                          <span style={{ color: '#ef4444', fontWeight: '600' }}>{backupCodesInfo.usedCodes}</span>
                        </div>
                        {backupCodesInfo.generatedAt && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Generated:</span>
                            <span style={{ color: darkMode ? '#e5e7eb' : '#1f2937', fontSize: '0.85rem' }}>
                              {new Date(backupCodesInfo.generatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {backupCodesInfo.nextRegenerationDate && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Can Regenerate:</span>
                            <span style={{
                              color: backupCodesInfo.canRegenerate ? '#10b981' : '#f59e0b',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              {backupCodesInfo.canRegenerate ? 'Now' : new Date(backupCodesInfo.nextRegenerationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowBackupCodes(false);
                        setShowRegenerateModal(true);
                        setRegenerateError('');
                        setRegeneratePassword('');
                      }}
                      disabled={backupCodesInfo && !backupCodesInfo.canRegenerate}
                      style={{
                        ...styles.submitButton,
                        background: backupCodesInfo?.canRegenerate
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : darkMode ? '#374151' : '#d1d5db',
                        cursor: backupCodesInfo?.canRegenerate ? 'pointer' : 'not-allowed',
                        opacity: backupCodesInfo?.canRegenerate ? 1 : 0.7
                      }}
                      className="action-button"
                    >
                      <Key size={18} />
                      <span>{backupCodesInfo?.canRegenerate ? 'Regenerate Backup Codes' : 'Regeneration Not Available Yet'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Remove 2FA Modal */}
        {showRemove2FAModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowRemove2FAModal(false);
            setRemove2FAPassword('');
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Remove Two-Factor Authentication
                </h2>
                <button
                  onClick={() => {
                    setShowRemove2FAModal(false);
                    setRemove2FAPassword('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{
                  ...styles.warningBox,
                  background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  <AlertCircle size={20} color="#ef4444" />
                  <span style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                    This will make your account less secure. Are you sure you want to disable two-factor authentication?
                  </span>
                </div>

                <form onSubmit={handleRemove2FA}>
                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={remove2FAPassword}
                      onChange={(e) => setRemove2FAPassword(e.target.value)}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#1f2937',
                        border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`
                      }}
                      placeholder="Enter your password"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    }}
                    className="action-button"
                  >
                    Remove 2FA
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Regenerate Backup Codes Modal */}
        {showRegenerateModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowRegenerateModal(false);
            setRegeneratePassword('');
            setRegenerateError('');
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                maxWidth: '440px'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Regenerate Backup Codes
                </h2>
                <button
                  onClick={() => {
                    setShowRegenerateModal(false);
                    setRegeneratePassword('');
                    setRegenerateError('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{
                  ...styles.warningBox,
                  background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <span style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>
                    This will invalidate all your current backup codes. New codes will only be shown once!
                  </span>
                </div>

                {regenerateError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    {regenerateError}
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={regeneratePassword}
                    onChange={(e) => setRegeneratePassword(e.target.value)}
                    style={{
                      ...styles.input,
                      background: darkMode ? '#0f0f1a' : '#ffffff',
                      color: darkMode ? '#ffffff' : '#1f2937',
                      border: `2px solid ${darkMode ? '#2a2a3e' : '#e5e7eb'}`
                    }}
                    placeholder="Enter your password"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={regenerateLoading || !regeneratePassword}
                  style={{
                    ...styles.submitButton,
                    background: regenerateLoading || !regeneratePassword
                      ? darkMode ? '#374151' : '#d1d5db'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    cursor: regenerateLoading || !regeneratePassword ? 'not-allowed' : 'pointer'
                  }}
                  className="action-button"
                >
                  {regenerateLoading ? (
                    <>
                      <Loader size={18} className="spinner" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      <span>Regenerate Codes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disable Account Modal */}
        {showDisableModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowDisableModal(false);
            setAccountActionPassword('');
            setAccountActionError('');
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Disable Account
                </h2>
                <button
                  onClick={() => {
                    setShowDisableModal(false);
                    setAccountActionPassword('');
                    setAccountActionError('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{
                  ...styles.warningBox,
                  background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <div style={{ color: darkMode ? '#fbbf24' : '#d97706' }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      Your account will be temporarily disabled:
                    </p>
                    <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
                      <li>You will be logged out immediately</li>
                      <li>Your data will be preserved</li>
                      <li>You can reactivate by logging in again</li>
                    </ul>
                  </div>
                </div>

                <form onSubmit={handleDisableAccount}>
                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={accountActionPassword}
                      onChange={(e) => {
                        setAccountActionPassword(e.target.value);
                        setAccountActionError('');
                      }}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#1f2937',
                        border: `2px solid ${accountActionError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`
                      }}
                      placeholder="Enter your password"
                      autoFocus
                      required
                    />
                  </div>

                  {accountActionError && (
                    <div style={styles.errorText}>
                      <X size={16} color="#ef4444" />
                      <span>{accountActionError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    }}
                    className="action-button"
                  >
                    Disable Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowDeleteModal(false);
            setAccountActionPassword('');
            setAccountActionError('');
          }}>
            <div
              style={{
                ...styles.modal,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
              }}
              onClick={(e) => e.stopPropagation()}
              className="modal-slide"
            >
              <div style={styles.modalHeader}>
                <h2 style={{
                  ...styles.modalTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Delete Account
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAccountActionPassword('');
                    setAccountActionError('');
                  }}
                  style={styles.modalClose}
                >
                  <X size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{
                  ...styles.warningBox,
                  background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  <AlertCircle size={20} color="#ef4444" />
                  <div style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                    <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                      WARNING: This action cannot be undone!
                    </p>
                    <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
                      <li>All your data will be permanently deleted</li>
                      <li>Your bookings will be cancelled</li>
                      <li>You cannot recover your account</li>
                      <li>This action is irreversible</li>
                    </ul>
                  </div>
                </div>

                <form onSubmit={handleDeleteAccount}>
                  <div style={styles.formGroup}>
                    <label style={{
                      ...styles.label,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={accountActionPassword}
                      onChange={(e) => {
                        setAccountActionPassword(e.target.value);
                        setAccountActionError('');
                      }}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#1f2937',
                        border: `2px solid ${accountActionError ? '#ef4444' : darkMode ? '#2a2a3e' : '#e5e7eb'}`
                      }}
                      placeholder="Enter your password"
                      autoFocus
                      required
                    />
                  </div>

                  {accountActionError && (
                    <div style={styles.errorText}>
                      <X size={16} color="#ef4444" />
                      <span>{accountActionError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    }}
                    className="action-button"
                  >
                    Permanently Delete Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const accountStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .spinner-icon {
    animation: spin 1s linear infinite;
  }

  .action-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .action-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .action-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .modal-slide {
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .success-banner {
    animation: bannerSlide 0.4s ease;
  }

  @keyframes bannerSlide {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Phone Modal Styles */
  .country-button:hover {
    border-color: rgba(16, 185, 129, 0.5) !important;
  }

  .dark-mode .country-item:hover {
    background: rgba(16, 185, 129, 0.1) !important;
  }

  body:not(.dark-mode) .country-item:hover {
    background: rgba(16, 185, 129, 0.08) !important;
  }

  .country-dropdown {
    animation: dropdownSlide 0.15s ease;
  }

  @keyframes dropdownSlide {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styles = {
  container: {
    minHeight: '100vh',
    padding: '3rem 2rem',
    transition: 'background 0.3s ease'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '1.5rem'
  },
  spinner: {
    strokeWidth: 3,
  },
  loadingText: {
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  successBanner: {
    position: 'fixed',
    top: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    padding: '1rem 2rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    minWidth: '400px',
    maxWidth: '600px',
    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
  },
  successBannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600'
  },
  successBannerClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s ease'
  },
  mainContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  card: {
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '2.5rem 3rem',
    borderBottom: '2px solid rgba(16, 185, 129, 0.2)'
  },
  cardTitle: {
    fontSize: '2.5rem',
    fontWeight: '900',
    marginBottom: '0.5rem',
    letterSpacing: '-0.5px'
  },
  cardSubtitle: {
    fontSize: '1.1rem',
    fontWeight: '500',
    lineHeight: 1.6
  },
  cardBody: {
    padding: '3rem'
  },
  section: {
    marginBottom: '2rem'
  },
  fieldLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.75rem',
    display: 'block'
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  fieldValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    flex: 1
  },
  editRow: {
    display: 'flex',
    gap: '1rem',
    width: '100%'
  },
  input: {
    flex: 1,
    padding: '0.875rem 1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  editButton: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  saveButton: {
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#ffffff',
    whiteSpace: 'nowrap'
  },
  removeButton: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem'
  },
  divider: {
    height: '1px',
    width: '100%',
    margin: '2rem 0'
  },
  sectionHeader: {
    fontSize: '1.25rem',
    fontWeight: '800',
    marginBottom: '1rem',
    letterSpacing: '-0.3px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    justifyContent: 'center'
  },
  subsectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '0.5rem'
  },
  subsectionDesc: {
    fontSize: '0.95rem',
    lineHeight: '1.6'
  },
  twoFactorHeader: {
    marginBottom: '1rem'
  },
  twoFactorEnabled: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '700'
  },
  twoFactorActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    justifyContent: 'center'
  },
  dangerTextButton: {
    background: 'none',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.5rem',
    transition: 'all 0.3s ease'
  },
  warningBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem'
  },
  dangerZone: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem'
  },
  modal: {
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 80px rgba(0,0,0,0.3)'
  },
  largeModal: {
    maxWidth: '600px'
  },
  modalHeader: {
    padding: '2rem',
    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.3px'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s ease'
  },
  modalBody: {
    padding: '2rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
    display: 'block'
  },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginTop: '0.5rem'
  },
  infoBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
  },
  passwordInputWrapper: {
    position: 'relative'
  },
  passwordToggle: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s ease'
  },
  passwordRequirements: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  requirementText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },
  qrSection: {
    marginBottom: '2rem'
  },
  instructionText: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  qrCodeWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  qrCodePlaceholder: {
    width: '250px',
    height: '250px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  backupCodesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem'
  },
  backupCode: {
    fontSize: '1.1rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'center',
    padding: '0.75rem',
    letterSpacing: '0.1rem'
  },
  // Phone Modal Discord-inspired Styles
  phoneModal: {
    borderRadius: '12px',
    maxWidth: '440px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 80px rgba(0,0,0,0.3)'
  },
  phoneModalHeader: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: 'none'
  },
  phoneModalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.2px'
  },
  phoneModalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.15s ease'
  },
  phoneModalBody: {
    padding: '0 1.25rem 1.25rem'
  },
  phoneModalDesc: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    marginBottom: '1.25rem',
    margin: '0 0 1.25rem 0'
  },
  phoneInputRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1rem',
    marginBottom: '1rem'
  },
  countrySection: {
    display: 'flex',
    flexDirection: 'column'
  },
  phoneSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  phoneLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem'
  },
  countryButton: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
    outline: 'none'
  },
  countryButtonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    overflow: 'hidden'
  },
  countryFlag: {
    fontSize: '1.25rem',
    flexShrink: 0
  },
  countryIso: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    flexShrink: 0
  },
  countryName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  countryDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    maxHeight: '320px',
    overflow: 'hidden',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  },
  countrySearchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderBottom: '1px solid rgba(0,0,0,0.1)'
  },
  countrySearchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  countryList: {
    overflowY: 'auto',
    maxHeight: '260px'
  },
  countryItem: {
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background 0.15s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
    textAlign: 'left'
  },
  countryItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  countryItemIso: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    minWidth: '32px'
  },
  phoneInput: {
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  phoneModalInfo: {
    fontSize: '0.75rem',
    lineHeight: '1.5',
    marginBottom: '1.25rem'
  },
  phoneModalActions: {
    display: 'flex',
    justifyContent: 'center'
  },
  phoneSubmitButton: {
    padding: '0.75rem 2.5rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: 'none'
  }
};

export default Account;
