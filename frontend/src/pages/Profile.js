import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Edit2,
  Save, X, Camera, Award, TrendingUp, Star, CheckCircle,
  Settings, Bell, Lock, Globe, Sun, Moon, Sparkles
} from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return savedUser.darkMode || false;
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    setEditForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      location: currentUser.location || '',
    });
    setLoading(false);
  };

  const handleSave = () => {
    // Update user in localStorage
    const updatedUser = { ...user, ...editForm };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
    });
    setIsEditing(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.darkMode = newMode;
    localStorage.setItem('user', JSON.stringify(currentUser));

    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberSince = (createdAt) => {
    if (!createdAt) return 'Recently';
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{
        ...styles.loading,
        background: darkMode ? '#000000' : '#f9fafb',
      }}>
        <div style={styles.loaderWrapper}>
          <div className="spinner" style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(16, 185, 129, 0.1)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
          }} />
          <p style={{
            ...styles.loadingText,
            color: darkMode ? '#9ca3af' : '#6b7280',
          }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{profileAnimations}</style>

      <div style={{
        ...styles.container,
        background: darkMode
          ? 'radial-gradient(ellipse at top, #0a0a1a 0%, #050510 50%, #000000 100%)'
          : 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}>
        {/* Hero Header */}
        <div style={{
          ...styles.hero,
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }}>
          <div style={styles.heroContent}>
            {/* Profile Picture */}
            <div className="scroll-reveal" style={styles.avatarWrapper}>
              <div style={styles.avatar}>
                <span style={styles.avatarText}>{getInitials(user?.name)}</span>
              </div>
              <div style={styles.cameraIcon} className="clickable hover-lift">
                <Camera size={20} color="#ffffff" />
              </div>
            </div>

            <h1 className="paradise-title scroll-reveal" style={styles.userName}>
              {user?.name}
            </h1>

            <div className="scroll-reveal" style={styles.userRole}>
              {user?.role === 'admin' ? (
                <>
                  <Shield size={18} color="#f59e0b" />
                  <span>Administrator</span>
                </>
              ) : (
                <>
                  <Star size={18} color="#f59e0b" />
                  <span>Premium Member</span>
                </>
              )}
            </div>

            <p className="scroll-reveal" style={styles.memberSince}>
              <Calendar size={16} />
              <span>Member since {getMemberSince(user?.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          <div style={styles.grid}>
            {/* Profile Information Card */}
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
                  <User size={24} color="#10b981" />
                  <span>Profile Information</span>
                </h2>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={styles.editButton}
                    className="clickable hover-lift"
                  >
                    <Edit2 size={18} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div style={styles.actionButtons}>
                    <button
                      onClick={handleSave}
                      style={{
                        ...styles.saveButton,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      }}
                      className="clickable hover-lift"
                    >
                      <Save size={18} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{
                        ...styles.cancelButton,
                        background: darkMode ? '#ef4444' : '#fee2e2',
                        color: darkMode ? '#fff' : '#dc2626',
                      }}
                      className="clickable hover-lift"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={styles.cardBody}>
                {/* Name Field */}
                <div style={styles.field}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <User size={18} color="#10b981" />
                    <span>Full Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#f9fafb',
                        color: darkMode ? '#fff' : '#1f2937',
                        border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <span style={{
                      ...styles.value,
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                    }}>
                      {user?.name}
                    </span>
                  )}
                </div>

                {/* Email Field */}
                <div style={styles.field}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <Mail size={18} color="#0ea5e9" />
                    <span>Email Address</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#f9fafb',
                        color: darkMode ? '#fff' : '#1f2937',
                        border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <span style={{
                      ...styles.value,
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                    }}>
                      {user?.email}
                    </span>
                  )}
                </div>

                {/* Phone Field */}
                <div style={styles.field}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <Phone size={18} color="#8b5cf6" />
                    <span>Phone Number</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#f9fafb',
                        color: darkMode ? '#fff' : '#1f2937',
                        border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <span style={{
                      ...styles.value,
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                    }}>
                      {user?.phone || 'Not provided'}
                    </span>
                  )}
                </div>

                {/* Location Field */}
                <div style={styles.field}>
                  <label style={{
                    ...styles.label,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    <MapPin size={18} color="#f59e0b" />
                    <span>Location</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Enter your location"
                      style={{
                        ...styles.input,
                        background: darkMode ? '#0f0f1a' : '#f9fafb',
                        color: darkMode ? '#fff' : '#1f2937',
                        border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <span style={{
                      ...styles.value,
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                    }}>
                      {user?.location || 'Not provided'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats & Achievements */}
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
                  <Award size={24} color="#10b981" />
                  <span>Travel Stats</span>
                </h2>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.statsGrid}>
                  <div style={{
                    ...styles.statBox,
                    background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  }}>
                    <TrendingUp size={32} color="#10b981" />
                    <span style={{
                      ...styles.statValue,
                      color: darkMode ? '#ffffff' : '#1f2937',
                    }}>
                      0
                    </span>
                    <span style={{
                      ...styles.statLabel,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}>
                      Total Trips
                    </span>
                  </div>

                  <div style={{
                    ...styles.statBox,
                    background: darkMode ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                  }}>
                    <Globe size={32} color="#0ea5e9" />
                    <span style={{
                      ...styles.statValue,
                      color: darkMode ? '#ffffff' : '#1f2937',
                    }}>
                      0
                    </span>
                    <span style={{
                      ...styles.statLabel,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}>
                      Countries Visited
                    </span>
                  </div>

                  <div style={{
                    ...styles.statBox,
                    background: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                  }}>
                    <Star size={32} color="#8b5cf6" />
                    <span style={{
                      ...styles.statValue,
                      color: darkMode ? '#ffffff' : '#1f2937',
                    }}>
                      0
                    </span>
                    <span style={{
                      ...styles.statLabel,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}>
                      Reviews Given
                    </span>
                  </div>

                  <div style={{
                    ...styles.statBox,
                    background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  }}>
                    <CheckCircle size={32} color="#f59e0b" />
                    <span style={{
                      ...styles.statValue,
                      color: darkMode ? '#ffffff' : '#1f2937',
                    }}>
                      {user?.role === 'admin' ? 'Admin' : 'Active'}
                    </span>
                    <span style={{
                      ...styles.statLabel,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}>
                      Account Status
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Card */}
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
                  <Settings size={24} color="#10b981" />
                  <span>Preferences</span>
                </h2>
              </div>

              <div style={styles.cardBody}>
                {/* Dark Mode Toggle */}
                <div style={styles.settingRow}>
                  <div style={styles.settingInfo}>
                    {darkMode ? (
                      <Moon size={20} color="#10b981" />
                    ) : (
                      <Sun size={20} color="#f59e0b" />
                    )}
                    <div>
                      <span style={{
                        ...styles.settingTitle,
                        color: darkMode ? '#e5e7eb' : '#1f2937',
                      }}>
                        Dark Mode
                      </span>
                      <span style={{
                        ...styles.settingDesc,
                        color: darkMode ? '#9ca3af' : '#6b7280',
                      }}>
                        Switch between light and dark themes
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleDarkMode}
                    style={{
                      ...styles.toggle,
                      background: darkMode ? '#10b981' : '#d1d5db',
                    }}
                    className="clickable"
                  >
                    <div style={{
                      ...styles.toggleBall,
                      transform: darkMode ? 'translateX(24px)' : 'translateX(2px)',
                    }} />
                  </button>
                </div>

                <div style={{
                  ...styles.divider,
                  background: darkMode ? '#2a2a3e' : '#e5e7eb',
                }} />

                {/* Notification Setting */}
                <div style={styles.settingRow}>
                  <div style={styles.settingInfo}>
                    <Bell size={20} color="#0ea5e9" />
                    <div>
                      <span style={{
                        ...styles.settingTitle,
                        color: darkMode ? '#e5e7eb' : '#1f2937',
                      }}>
                        Notifications
                      </span>
                      <span style={{
                        ...styles.settingDesc,
                        color: darkMode ? '#9ca3af' : '#6b7280',
                      }}>
                        Receive booking updates and offers
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      ...styles.toggle,
                      background: '#10b981',
                    }}
                    className="clickable"
                  >
                    <div style={{
                      ...styles.toggleBall,
                      transform: 'translateX(24px)',
                    }} />
                  </button>
                </div>

                <div style={{
                  ...styles.divider,
                  background: darkMode ? '#2a2a3e' : '#e5e7eb',
                }} />

                {/* Security Button */}
                <button
                  style={{
                    ...styles.securityButton,
                    background: darkMode ? '#0f0f1a' : '#f9fafb',
                    color: darkMode ? '#e5e7eb' : '#1f2937',
                    border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
                  }}
                  className="clickable hover-lift"
                >
                  <Lock size={20} color="#ef4444" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const profileAnimations = `
  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .hover-lift:hover {
    transform: translateY(-4px) scale(1.02);
  }
`;

const styles = {
  container: {
    minHeight: '100vh',
    transition: 'background 1.2s ease',
  },
  hero: {
    padding: '4rem 2rem 3rem 2rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: '150px',
    height: '150px',
    margin: '0 auto 2rem auto',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid rgba(255,255,255,0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  avatarText: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#ffffff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
    transition: 'all 0.3s ease',
  },
  userName: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: '1rem',
  },
  userRole: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1rem',
    marginBottom: '1rem',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  memberSince: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '1rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  },
  card: {
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
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
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cardBody: {
    padding: '2rem',
  },
  field: {
    marginBottom: '2rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: '600',
    padding: '0.75rem 0',
  },
  input: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  statBox: {
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '900',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
  },
  settingInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  settingTitle: {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  settingDesc: {
    display: 'block',
    fontSize: '0.85rem',
  },
  toggle: {
    width: '52px',
    height: '28px',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  toggleBall: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ffffff',
    position: 'absolute',
    top: '2px',
    transition: 'all 0.3s ease',
  },
  divider: {
    height: '1px',
    margin: '1rem 0',
  },
  securityButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '1rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  loaderWrapper: {
    textAlign: 'center',
  },
  loadingText: {
    marginTop: '1.5rem',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
};

export default Profile;
