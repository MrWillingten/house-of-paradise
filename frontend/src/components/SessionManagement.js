import React, { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  LogOut,
  Shield,
  AlertTriangle,
  X,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';

const SessionManagement = ({ userId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch sessions from API
  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('accessToken');
      const response = await api.get('/api/auth/sessions');

      // Assuming response structure: { success: true, data: [...sessions] }
      setSessions(response.data.data || response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.response?.data?.message || 'Failed to load sessions');
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchSessions();

    const interval = setInterval(() => {
      fetchSessions();
    }, 30000); // 30 seconds

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchSessions]);

  // Sign out specific session
  const handleSignOutSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const token = localStorage.getItem('accessToken');

      await api.delete(`/api/auth/sessions/${sessionId}`);

      // Remove session from local state
      setSessions(sessions.filter((s) => s.id !== sessionId));
      setActionLoading(null);
    } catch (err) {
      console.error('Error signing out session:', err);
      alert(err.response?.data?.message || 'Failed to sign out session');
      setActionLoading(null);
    }
  };

  // Sign out all other sessions
  const handleSignOutAllOthers = async () => {
    try {
      setActionLoading('all');
      const token = localStorage.getItem('accessToken');

      await api.delete('/api/auth/sessions/all');

      // Keep only current session
      setSessions(sessions.filter((s) => s.isCurrent));
      setShowConfirmModal(false);
      setActionLoading(null);
    } catch (err) {
      console.error('Error signing out all sessions:', err);
      alert(err.response?.data?.message || 'Failed to sign out all sessions');
      setActionLoading(null);
      setShowConfirmModal(false);
    }
  };

  // Get device icon based on device type
  const getDeviceIcon = (deviceType) => {
    const type = deviceType?.toLowerCase() || '';
    if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone size={24} color="#10b981" />;
    }
    if (type.includes('tablet') || type.includes('ipad')) {
      return <Tablet size={24} color="#10b981" />;
    }
    return <Monitor size={24} color="#10b981" />;
  };

  // Mask IP address for privacy
  const maskIpAddress = (ip) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `xxx.xxx.xxx.${parts[3]}`;
    }
    return 'xxx.xxx.xxx.xxx';
  };

  // Format last active time
  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Unknown';

    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

    return lastActive.toLocaleDateString();
  };

  // Check if only current session exists
  const onlyCurrentSession = sessions.length === 1 && sessions[0]?.isCurrent;
  const hasOtherSessions = sessions.some((s) => !s.isCurrent);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="spinner-large" />
          <p style={styles.loadingText}>Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <h3 style={styles.errorTitle}>Failed to Load Sessions</h3>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={fetchSessions} style={styles.retryButton} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Shield size={28} color="#10b981" />
          <div>
            <h2 style={styles.title}>Active Sessions</h2>
            <p style={styles.subtitle}>Manage your account security and active logins</p>
          </div>
        </div>

        {hasOtherSessions && (
          <button
            onClick={() => setShowConfirmModal(true)}
            style={styles.signOutAllButton}
            className="sign-out-all-btn"
            disabled={actionLoading === 'all'}
          >
            <LogOut size={18} />
            {actionLoading === 'all' ? 'Signing out...' : 'Sign Out All Others'}
          </button>
        )}
      </div>

      {/* Empty State */}
      {onlyCurrentSession && (
        <div style={styles.emptyState}>
          <Shield size={64} color="#10b981" />
          <h3 style={styles.emptyTitle}>Only This Device is Active</h3>
          <p style={styles.emptyMessage}>
            You're currently signed in on this device only. If you sign in on another device,
            it will appear here.
          </p>
        </div>
      )}

      {/* Sessions List */}
      {!onlyCurrentSession && (
        <div style={styles.sessionsList}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={session.isCurrent ? styles.sessionCardCurrent : styles.sessionCard}
              className="session-card"
            >
              {/* Current Session Badge */}
              {session.isCurrent && (
                <div style={styles.currentBadge}>
                  <CheckCircle size={14} />
                  This device
                </div>
              )}

              <div style={styles.sessionContent}>
                {/* Device Icon */}
                <div style={styles.deviceIconContainer}>
                  {getDeviceIcon(session.deviceType)}
                </div>

                {/* Session Details */}
                <div style={styles.sessionDetails}>
                  {/* Device Info */}
                  <div style={styles.deviceInfo}>
                    <h4 style={styles.deviceName}>
                      {session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}
                    </h4>
                    {session.deviceType && (
                      <span style={styles.deviceType}>{session.deviceType}</span>
                    )}
                  </div>

                  {/* Location */}
                  {(session.city || session.country) && (
                    <div style={styles.infoRow}>
                      <MapPin size={14} color="#6b7280" />
                      <span style={styles.infoText}>
                        {session.city && session.country
                          ? `${session.city}, ${session.country}`
                          : session.city || session.country}
                      </span>
                    </div>
                  )}

                  {/* IP Address */}
                  <div style={styles.infoRow}>
                    <div style={styles.ipIcon}>IP</div>
                    <span style={styles.infoText}>{maskIpAddress(session.ipAddress)}</span>
                  </div>

                  {/* Last Active */}
                  <div style={styles.infoRow}>
                    <Clock size={14} color="#6b7280" />
                    <span
                      style={{
                        ...styles.infoText,
                        color: session.isCurrent ? '#10b981' : '#6b7280',
                        fontWeight: session.isCurrent ? '700' : '600',
                      }}
                    >
                      {formatLastActive(session.lastActive)}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div style={styles.sessionActions}>
                  <button
                    onClick={() => handleSignOutSession(session.id)}
                    style={
                      session.isCurrent
                        ? styles.signOutButtonDisabled
                        : styles.signOutButton
                    }
                    className="sign-out-btn"
                    disabled={session.isCurrent || actionLoading === session.id}
                  >
                    {actionLoading === session.id ? (
                      <>
                        <div className="spinner-small" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        Sign Out
                      </>
                    )}
                  </button>
                  {session.isCurrent && (
                    <span style={styles.currentLabel}>Current session</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <AlertTriangle size={48} color="#f59e0b" />
              <h3 style={styles.modalTitle}>Sign Out All Other Sessions?</h3>
            </div>

            <p style={styles.modalMessage}>
              This will sign you out from all devices except this one. You'll need to sign in
              again on those devices. This action cannot be undone.
            </p>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={styles.cancelButton}
                className="cancel-btn"
                disabled={actionLoading === 'all'}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutAllOthers}
                style={styles.confirmButton}
                className="confirm-btn"
                disabled={actionLoading === 'all'}
              >
                {actionLoading === 'all' ? (
                  <>
                    <div className="spinner-small" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    Sign Out All Others
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowConfirmModal(false)}
              style={styles.closeButton}
              className="modal-close-btn"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
  },
  loadingText: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  errorMessage: {
    fontSize: '1rem',
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: '400px',
  },
  retryButton: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '1rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: '0.25rem 0 0 0',
  },
  signOutAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    textAlign: 'center',
    gap: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  emptyMessage: {
    fontSize: '1rem',
    color: '#6b7280',
    maxWidth: '500px',
    lineHeight: '1.6',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sessionCard: {
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.3s',
    position: 'relative',
  },
  sessionCardCurrent: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
    border: '2px solid #10b981',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.3s',
    position: 'relative',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
  },
  currentBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  sessionContent: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  deviceIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    background: '#f0fdf4',
    borderRadius: '16px',
    flexShrink: 0,
  },
  sessionDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  deviceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  deviceName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  deviceType: {
    fontSize: '0.75rem',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontWeight: '600',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ipIcon: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
  },
  infoText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  sessionActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-end',
  },
  signOutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'white',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  signOutButtonDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: '#f3f4f6',
    color: '#9ca3af',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'not-allowed',
    opacity: 0.6,
    whiteSpace: 'nowrap',
  },
  currentLabel: {
    fontSize: '0.75rem',
    color: '#059669',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
};

// Global styles with dark mode support
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Spinner animations */
    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f4f6;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Session card hover effects */
    .session-card:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    /* Button hover effects */
    .sign-out-all-btn:hover:not(:disabled) {
      background: #dc2626;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
    }

    .sign-out-all-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .sign-out-btn:hover:not(:disabled) {
      background: #dc2626;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
    }

    .cancel-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-2px);
    }

    .confirm-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
    }

    .confirm-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .modal-close-btn:hover {
      background: #f3f4f6;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .session-card,
      .session-card-current {
        background: #1f2937;
        border-color: #374151;
      }

      .session-card-current {
        background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
        border-color: #10b981;
      }

      .device-icon-container {
        background: #065f46;
      }

      .device-name,
      .modal-title,
      .empty-title,
      .error-title,
      h2 {
        color: #f9fafb;
      }

      .subtitle,
      .info-text,
      .empty-message,
      .modal-message,
      .loading-text {
        color: #d1d5db;
      }

      .device-type,
      .ip-icon {
        background: #374151;
        color: #d1d5db;
      }

      .sign-out-button-disabled {
        background: #374151;
        border-color: #4b5563;
        color: #6b7280;
      }

      .modal {
        background: #1f2937;
      }

      .cancel-button {
        background: #374151;
        border-color: #4b5563;
        color: #d1d5db;
      }

      .cancel-btn:hover {
        background: #4b5563;
      }

      .modal-close-btn {
        color: #d1d5db;
      }

      .modal-close-btn:hover {
        background: #374151;
      }

      .header,
      .empty-state,
      .error-container {
        background: #1f2937;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .session-content {
        flex-direction: column;
      }

      .session-actions {
        align-items: flex-start;
        width: 100%;
      }

      .sign-out-button,
      .sign-out-button-disabled {
        width: 100%;
        justify-content: center;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .sign-out-all-button {
        width: 100%;
        justify-content: center;
      }

      .modal-actions {
        flex-direction: column;
      }

      .cancel-button,
      .confirm-button {
        width: 100%;
        justify-content: center;
      }

      .current-badge {
        position: static;
        margin-bottom: 1rem;
      }
    }
  `;
  document.head.appendChild(style);
}

export default SessionManagement;
