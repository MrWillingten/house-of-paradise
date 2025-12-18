import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelService, tripService, authService, adminService, bookingService, paymentService } from '../services/api';
import {
  Plus, Edit2, Trash2, Hotel, Plane, LogOut, Users, BarChart3, Terminal,
  Shield, ShieldOff, Key, UserX, Search, RefreshCw, ChevronRight, X,
  DollarSign, CreditCard, Activity, Server, Database, Globe, Clock,
  CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Copy, Send,
  Settings, Moon, Sun, Download, Upload, Filter, MoreVertical,
  Mail, Phone, Calendar, MapPin, Star, Home, TrendingUp, Zap,
  Lock, Unlock, UserCheck, UserMinus, AlertCircle, Info, HelpCircle
} from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();

  // Dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : true;
  });

  // Main state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data state
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // CLI Terminal state
  const [cliOpen, setCliOpen] = useState(false);
  const [cliHistory, setCliHistory] = useState([
    { type: 'system', text: '=================================' },
    { type: 'system', text: '  House of Paradise Admin CLI' },
    { type: 'system', text: '  Type "help" for commands' },
    { type: 'system', text: '=================================' },
  ]);
  const [cliInput, setCliInput] = useState('');
  const [cliCommandHistory, setCliCommandHistory] = useState([]);
  const [cliHistoryIndex, setCliHistoryIndex] = useState(-1);
  const cliInputRef = useRef(null);
  const cliOutputRef = useRef(null);

  // System health (simulated)
  const [systemHealth, setSystemHealth] = useState({
    api: 'healthy',
    database: 'healthy',
    auth: 'healthy',
    hotel: 'healthy',
    trip: 'healthy',
    payment: 'healthy'
  });

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('admin-dark-mode');
    } else {
      document.body.classList.remove('admin-dark-mode');
    }
  }, [darkMode]);

  // Check admin access
  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/login');
      return;
    }
    fetchAllData();
    checkSystemHealth();
  }, []);

  // Auto-scroll CLI output
  useEffect(() => {
    if (cliOutputRef.current) {
      cliOutputRef.current.scrollTop = cliOutputRef.current.scrollHeight;
    }
  }, [cliHistory]);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('https://hop-api-gateway.onrender.com/health');
      const data = await response.json();
      setSystemHealth({
        api: data.gateway === 'ok' ? 'healthy' : 'unhealthy',
        database: 'healthy',
        auth: data.auth === 'ok' ? 'healthy' : 'unhealthy',
        hotel: data.hotel === 'ok' ? 'healthy' : 'unhealthy',
        trip: data.trip === 'ok' ? 'healthy' : 'unhealthy',
        payment: data.payment === 'ok' ? 'healthy' : 'unhealthy'
      });
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, hotelsRes, tripsRes] = await Promise.all([
        adminService.getStats().catch(() => ({ data: { data: {} } })),
        adminService.getAllUsers().catch(() => ({ data: { data: [] } })),
        hotelService.getAll().catch(() => ({ data: { data: [] } })),
        tripService.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      setStats({
        ...statsRes.data?.data,
        totalHotels: hotelsRes.data?.data?.length || 0,
        totalTrips: tripsRes.data?.data?.length || 0
      });
      setUsers(usersRes.data?.data || []);
      setHotels(hotelsRes.data?.data || []);
      setTrips(tripsRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // User Management Functions
  const handlePromoteUser = async (userId) => {
    if (!window.confirm('Promote this user to admin?')) return;
    try {
      await adminService.promoteUser(userId);
      showNotification('User promoted to admin!');
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to promote user', 'error');
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!window.confirm('Demote this admin to regular user?')) return;
    try {
      await adminService.demoteUser(userId);
      showNotification('Admin demoted to user!');
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to demote user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      showNotification('User deleted successfully!');
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      await adminService.resetPassword(userId, newPassword);
      showNotification('Password reset successfully!');
      setShowModal(false);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to reset password', 'error');
    }
  };

  // Hotel Management Functions
  const handleSaveHotel = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amenities: formData.amenities?.split(',').map(a => a.trim()).filter(Boolean) || [],
        pricePerNight: Number(formData.pricePerNight),
        availableRooms: Number(formData.availableRooms || formData.roomsAvailable),
        rating: Number(formData.rating)
      };

      if (editingItem) {
        await hotelService.update(editingItem._id, payload);
        showNotification('Hotel updated successfully!');
      } else {
        await hotelService.create(payload);
        showNotification('Hotel created successfully!');
      }
      setShowModal(false);
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save hotel', 'error');
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Delete this hotel?')) return;
    try {
      await hotelService.delete(hotelId);
      showNotification('Hotel deleted!');
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete hotel', 'error');
    }
  };

  // Trip Management Functions
  const handleSaveTrip = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        availableSeats: Number(formData.availableSeats)
      };

      if (editingItem) {
        await tripService.update(editingItem.id, payload);
        showNotification('Trip updated successfully!');
      } else {
        await tripService.create(payload);
        showNotification('Trip created successfully!');
      }
      setShowModal(false);
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save trip', 'error');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await tripService.delete(tripId);
      showNotification('Trip deleted!');
      fetchAllData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete trip', 'error');
    }
  };

  // Modal Handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === 'hotel') {
      setFormData(item ? {
        ...item,
        amenities: item.amenities?.join(', ') || ''
      } : {
        name: '', location: '', pricePerNight: '', availableRooms: '', rating: '', amenities: '', description: ''
      });
    } else if (type === 'trip') {
      setFormData(item || {
        origin: '', destination: '', departureTime: '', arrivalTime: '',
        transportType: 'flight', price: '', availableSeats: '', carrier: ''
      });
    } else if (type === 'password') {
      setFormData({ userId: item._id, userName: item.name, newPassword: '' });
    } else if (type === 'userDetails') {
      setFormData(item);
    }

    setShowModal(true);
  };

  // CLI Command Processing
  const processCliCommand = useCallback(async (command) => {
    const cmd = command.trim().toLowerCase();
    const parts = cmd.split(' ');
    const action = parts[0];
    const args = parts.slice(1);

    const addOutput = (text, type = 'output') => {
      setCliHistory(prev => [...prev, { type, text }]);
    };

    addOutput(`> ${command}`, 'command');

    switch (action) {
      case 'help':
        addOutput('');
        addOutput('=== AVAILABLE COMMANDS ===', 'system');
        addOutput('');
        addOutput('USER MANAGEMENT:', 'system');
        addOutput('  users              - List all users');
        addOutput('  user <id>          - Get user details');
        addOutput('  promote <id>       - Promote user to admin');
        addOutput('  demote <id>        - Demote admin to user');
        addOutput('  deleteuser <id>    - Delete a user');
        addOutput('');
        addOutput('DATA MANAGEMENT:', 'system');
        addOutput('  hotels             - List hotels (first 10)');
        addOutput('  trips              - List trips');
        addOutput('  stats              - Show system statistics');
        addOutput('');
        addOutput('SYSTEM:', 'system');
        addOutput('  health             - Check service health');
        addOutput('  refresh            - Refresh all data');
        addOutput('  clear              - Clear terminal');
        addOutput('  exit               - Close terminal');
        addOutput('');
        break;

      case 'users':
        addOutput(`Total users: ${users.length}`, 'success');
        users.slice(0, 10).forEach((u, i) => {
          addOutput(`[${i + 1}] ${u.name} (${u.email}) - ${u.role === 'admin' ? 'ADMIN' : 'User'}`);
        });
        if (users.length > 10) addOutput(`... and ${users.length - 10} more`);
        break;

      case 'user':
        if (!args[0]) {
          addOutput('Usage: user <userId>', 'error');
        } else {
          const user = users.find(u => u._id === args[0] || u._id.includes(args[0]));
          if (user) {
            addOutput(`Name: ${user.name}`, 'success');
            addOutput(`Email: ${user.email}`);
            addOutput(`Role: ${user.role}`);
            addOutput(`Verified: ${user.isVerified ? 'Yes' : 'No'}`);
            addOutput(`2FA: ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}`);
            addOutput(`Created: ${new Date(user.createdAt).toLocaleString()}`);
          } else {
            addOutput('User not found', 'error');
          }
        }
        break;

      case 'promote':
        if (!args[0]) {
          addOutput('Usage: promote <userId>', 'error');
        } else {
          try {
            await adminService.promoteUser(args[0]);
            addOutput('User promoted to admin!', 'success');
            fetchAllData();
          } catch (err) {
            addOutput(`Error: ${err.response?.data?.error || err.message}`, 'error');
          }
        }
        break;

      case 'demote':
        if (!args[0]) {
          addOutput('Usage: demote <userId>', 'error');
        } else {
          try {
            await adminService.demoteUser(args[0]);
            addOutput('Admin demoted to user!', 'success');
            fetchAllData();
          } catch (err) {
            addOutput(`Error: ${err.response?.data?.error || err.message}`, 'error');
          }
        }
        break;

      case 'deleteuser':
        if (!args[0]) {
          addOutput('Usage: deleteuser <userId>', 'error');
        } else {
          try {
            await adminService.deleteUser(args[0]);
            addOutput('User deleted!', 'success');
            fetchAllData();
          } catch (err) {
            addOutput(`Error: ${err.response?.data?.error || err.message}`, 'error');
          }
        }
        break;

      case 'hotels':
        addOutput(`Total hotels: ${hotels.length}`, 'success');
        hotels.slice(0, 10).forEach((h, i) => {
          addOutput(`[${i + 1}] ${h.name} - ${h.location} - $${h.pricePerNight}/night`);
        });
        if (hotels.length > 10) addOutput(`... and ${hotels.length - 10} more`);
        break;

      case 'trips':
        addOutput(`Total trips: ${trips.length}`, 'success');
        trips.slice(0, 10).forEach((t, i) => {
          addOutput(`[${i + 1}] ${t.origin} -> ${t.destination} - $${t.price}`);
        });
        if (trips.length > 10) addOutput(`... and ${trips.length - 10} more`);
        break;

      case 'stats':
        addOutput('=== SYSTEM STATISTICS ===', 'system');
        addOutput(`Total Users: ${stats?.totalUsers || 0}`);
        addOutput(`Admins: ${stats?.totalAdmins || 0}`);
        addOutput(`Hotels: ${stats?.totalHotels || 0}`);
        addOutput(`Trips: ${stats?.totalTrips || 0}`);
        break;

      case 'health':
        addOutput('=== SERVICE HEALTH ===', 'system');
        Object.entries(systemHealth).forEach(([service, status]) => {
          const icon = status === 'healthy' ? '[OK]' : '[FAIL]';
          addOutput(`${icon} ${service.toUpperCase()}: ${status}`, status === 'healthy' ? 'success' : 'error');
        });
        break;

      case 'refresh':
        addOutput('Refreshing data...', 'system');
        await fetchAllData();
        addOutput('Data refreshed!', 'success');
        break;

      case 'clear':
        setCliHistory([
          { type: 'system', text: 'Terminal cleared.' },
        ]);
        break;

      case 'exit':
        setCliOpen(false);
        break;

      case '':
        break;

      default:
        addOutput(`Unknown command: ${action}. Type "help" for available commands.`, 'error');
    }
  }, [users, hotels, trips, stats, systemHealth]);

  const handleCliKeyDown = (e) => {
    if (e.key === 'Enter' && cliInput.trim()) {
      processCliCommand(cliInput);
      setCliCommandHistory(prev => [...prev, cliInput]);
      setCliHistoryIndex(-1);
      setCliInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cliCommandHistory.length > 0) {
        const newIndex = cliHistoryIndex < cliCommandHistory.length - 1 ? cliHistoryIndex + 1 : cliHistoryIndex;
        setCliHistoryIndex(newIndex);
        setCliInput(cliCommandHistory[cliCommandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cliHistoryIndex > 0) {
        const newIndex = cliHistoryIndex - 1;
        setCliHistoryIndex(newIndex);
        setCliInput(cliCommandHistory[cliCommandHistory.length - 1 - newIndex] || '');
      } else {
        setCliHistoryIndex(-1);
        setCliInput('');
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Filtered hotels
  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Styles
  const styles = getStyles(darkMode);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <Home size={28} />
            <span style={styles.logoText}>HoP Admin</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'hotels', icon: Hotel, label: 'Hotels' },
            { id: 'trips', icon: Plane, label: 'Trips' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
              style={{
                ...styles.navButton,
                ...(activeTab === item.id ? styles.navButtonActive : {})
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={() => setCliOpen(true)} style={styles.cliButton}>
            <Terminal size={18} />
            <span>Open CLI</span>
          </button>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <h1 style={styles.pageTitle}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'hotels' && 'Hotel Management'}
              {activeTab === 'trips' && 'Trip Management'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>

          <div style={styles.topBarRight}>
            <button onClick={fetchAllData} style={styles.iconButton} title="Refresh">
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} style={styles.iconButton} title="Toggle Theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={styles.adminBadge}>
              <Shield size={14} />
              <span>Admin</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div style={styles.errorNotification}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={styles.closeNotification}>
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div style={styles.successNotification}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Content */}
        <div style={styles.content}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div style={styles.dashboard}>
              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div style={styles.statIcon}><Users size={32} /></div>
                  <div style={styles.statInfo}>
                    <div style={styles.statNumber}>{stats?.totalUsers || 0}</div>
                    <div style={styles.statLabel}>Total Users</div>
                  </div>
                </div>

                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div style={styles.statIcon}><Shield size={32} /></div>
                  <div style={styles.statInfo}>
                    <div style={styles.statNumber}>{stats?.totalAdmins || 0}</div>
                    <div style={styles.statLabel}>Admins</div>
                  </div>
                </div>

                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <div style={styles.statIcon}><Hotel size={32} /></div>
                  <div style={styles.statInfo}>
                    <div style={styles.statNumber}>{stats?.totalHotels || 0}</div>
                    <div style={styles.statLabel}>Hotels</div>
                  </div>
                </div>

                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <div style={styles.statIcon}><Plane size={32} /></div>
                  <div style={styles.statInfo}>
                    <div style={styles.statNumber}>{stats?.totalTrips || 0}</div>
                    <div style={styles.statLabel}>Trips</div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Activity size={20} />
                  System Health
                </h2>
                <div style={styles.healthGrid}>
                  {Object.entries(systemHealth).map(([service, status]) => (
                    <div key={service} style={styles.healthCard}>
                      <div style={{
                        ...styles.healthIndicator,
                        background: status === 'healthy' ? '#10b981' : '#ef4444'
                      }} />
                      <div style={styles.healthInfo}>
                        <div style={styles.healthService}>{service.toUpperCase()}</div>
                        <div style={{
                          ...styles.healthStatus,
                          color: status === 'healthy' ? '#10b981' : '#ef4444'
                        }}>
                          {status === 'healthy' ? 'Operational' : 'Down'}
                        </div>
                      </div>
                      {status === 'healthy' ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Zap size={20} />
                  Quick Actions
                </h2>
                <div style={styles.quickActions}>
                  <button onClick={() => { setActiveTab('users'); }} style={styles.quickActionBtn}>
                    <Users size={20} />
                    <span>Manage Users</span>
                  </button>
                  <button onClick={() => openModal('hotel')} style={styles.quickActionBtn}>
                    <Plus size={20} />
                    <span>Add Hotel</span>
                  </button>
                  <button onClick={() => openModal('trip')} style={styles.quickActionBtn}>
                    <Plus size={20} />
                    <span>Add Trip</span>
                  </button>
                  <button onClick={() => setCliOpen(true)} style={styles.quickActionBtn}>
                    <Terminal size={20} />
                    <span>Open CLI</span>
                  </button>
                </div>
              </div>

              {/* Recent Users */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Clock size={20} />
                  Recent Users
                </h2>
                <div style={styles.recentList}>
                  {users.slice(0, 5).map(user => (
                    <div key={user._id} style={styles.recentItem}>
                      <div style={styles.recentAvatar}>
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div style={styles.recentInfo}>
                        <div style={styles.recentName}>{user.name}</div>
                        <div style={styles.recentEmail}>{user.email}</div>
                      </div>
                      <div style={{
                        ...styles.roleBadge,
                        background: user.role === 'admin' ? '#10b981' : '#6b7280'
                      }}>
                        {user.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {/* Search and Filter Bar */}
              <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>

                <div style={styles.resultCount}>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Users Table */}
              <div style={styles.tableContainer}>
                <div style={styles.tableHeader}>
                  <div style={{ flex: 2 }}>User</div>
                  <div style={{ flex: 2 }}>Email</div>
                  <div style={{ flex: 1 }}>Role</div>
                  <div style={{ flex: 1 }}>Status</div>
                  <div style={{ flex: 1 }}>Joined</div>
                  <div style={{ flex: 1.5, textAlign: 'right' }}>Actions</div>
                </div>

                {filteredUsers.map(user => (
                  <div key={user._id} style={styles.tableRow}>
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={styles.userAvatar}>
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" style={styles.avatarImg} />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <span style={styles.userName}>{user.name}</span>
                    </div>
                    <div style={{ flex: 2, color: darkMode ? '#9ca3af' : '#6b7280' }}>{user.email}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        ...styles.badge,
                        background: user.role === 'admin' ? '#10b981' : '#6b7280'
                      }}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        ...styles.badge,
                        background: user.isVerified ? '#3b82f6' : '#f59e0b'
                      }}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div style={{ flex: 1, color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ flex: 1.5, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => openModal('userDetails', user)}
                        style={styles.actionBtn}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {user.role === 'admin' ? (
                        <button
                          onClick={() => handleDemoteUser(user._id)}
                          style={{ ...styles.actionBtn, background: '#f59e0b' }}
                          title="Demote"
                        >
                          <ShieldOff size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePromoteUser(user._id)}
                          style={{ ...styles.actionBtn, background: '#10b981' }}
                          title="Promote"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openModal('password', user)}
                        style={{ ...styles.actionBtn, background: '#8b5cf6' }}
                        title="Reset Password"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        style={{ ...styles.actionBtn, background: '#ef4444' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div style={styles.emptyState}>
                    <Users size={48} style={{ opacity: 0.3 }} />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div>
              <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search hotels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <button onClick={() => openModal('hotel')} style={styles.addButton}>
                  <Plus size={18} />
                  Add Hotel
                </button>
              </div>

              <div style={styles.tableContainer}>
                <div style={styles.tableHeader}>
                  <div style={{ flex: 2 }}>Hotel</div>
                  <div style={{ flex: 2 }}>Location</div>
                  <div style={{ flex: 1 }}>Price</div>
                  <div style={{ flex: 1 }}>Rooms</div>
                  <div style={{ flex: 1 }}>Rating</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>Actions</div>
                </div>

                {filteredHotels.slice(0, 50).map(hotel => (
                  <div key={hotel._id} style={styles.tableRow}>
                    <div style={{ flex: 2, fontWeight: '600' }}>{hotel.name}</div>
                    <div style={{ flex: 2, color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      <MapPin size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                      {hotel.location}
                    </div>
                    <div style={{ flex: 1, color: '#10b981', fontWeight: '600' }}>
                      ${hotel.pricePerNight}
                    </div>
                    <div style={{ flex: 1 }}>{hotel.availableRooms || hotel.roomsAvailable || 0}</div>
                    <div style={{ flex: 1 }}>
                      <Star size={14} style={{ color: '#f59e0b', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                      {hotel.rating}
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => openModal('hotel', hotel)}
                        style={{ ...styles.actionBtn, background: '#3b82f6' }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(hotel._id)}
                        style={{ ...styles.actionBtn, background: '#ef4444' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredHotels.length > 50 && (
                  <div style={styles.moreInfo}>
                    Showing 50 of {filteredHotels.length} hotels
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div>
              <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <button onClick={() => openModal('trip')} style={styles.addButton}>
                  <Plus size={18} />
                  Add Trip
                </button>
              </div>

              <div style={styles.tableContainer}>
                <div style={styles.tableHeader}>
                  <div style={{ flex: 2 }}>Route</div>
                  <div style={{ flex: 1 }}>Type</div>
                  <div style={{ flex: 1 }}>Carrier</div>
                  <div style={{ flex: 1 }}>Price</div>
                  <div style={{ flex: 1 }}>Seats</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>Actions</div>
                </div>

                {trips.map(trip => (
                  <div key={trip.id} style={styles.tableRow}>
                    <div style={{ flex: 2, fontWeight: '600' }}>
                      {trip.origin} <ChevronRight size={14} style={{ verticalAlign: 'middle' }} /> {trip.destination}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        ...styles.badge,
                        background: trip.transportType === 'flight' ? '#3b82f6' :
                                   trip.transportType === 'train' ? '#10b981' : '#f59e0b'
                      }}>
                        {trip.transportType}
                      </span>
                    </div>
                    <div style={{ flex: 1, color: darkMode ? '#9ca3af' : '#6b7280' }}>{trip.carrier}</div>
                    <div style={{ flex: 1, color: '#10b981', fontWeight: '600' }}>${trip.price}</div>
                    <div style={{ flex: 1 }}>{trip.availableSeats}</div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => openModal('trip', trip)}
                        style={{ ...styles.actionBtn, background: '#3b82f6' }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        style={{ ...styles.actionBtn, background: '#ef4444' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {trips.length === 0 && (
                  <div style={styles.emptyState}>
                    <Plane size={48} style={{ opacity: 0.3 }} />
                    <p>No trips found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div style={styles.settingsContainer}>
              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>Appearance</h3>
                <div style={styles.settingItem}>
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Dark Mode</div>
                    <div style={styles.settingDescription}>Enable dark theme for the admin panel</div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                      ...styles.toggleButton,
                      background: darkMode ? '#10b981' : '#e5e7eb'
                    }}
                  >
                    <div style={{
                      ...styles.toggleKnob,
                      transform: darkMode ? 'translateX(24px)' : 'translateX(0)'
                    }} />
                  </button>
                </div>
              </div>

              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>Admin CLI</h3>
                <div style={styles.settingItem}>
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Terminal Access</div>
                    <div style={styles.settingDescription}>Open the built-in command line interface</div>
                  </div>
                  <button onClick={() => setCliOpen(true)} style={styles.settingButton}>
                    <Terminal size={16} />
                    Open CLI
                  </button>
                </div>
              </div>

              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>System</h3>
                <div style={styles.settingItem}>
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Refresh Data</div>
                    <div style={styles.settingDescription}>Reload all data from the server</div>
                  </div>
                  <button onClick={fetchAllData} style={styles.settingButton}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                <div style={styles.settingItem}>
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Check Health</div>
                    <div style={styles.settingDescription}>Verify all services are operational</div>
                  </div>
                  <button onClick={checkSystemHealth} style={styles.settingButton}>
                    <Activity size={16} />
                    Check
                  </button>
                </div>
              </div>

              <div style={styles.settingsSection}>
                <h3 style={styles.settingsSectionTitle}>About</h3>
                <div style={styles.aboutInfo}>
                  <p><strong>House of Paradise Admin Panel</strong></p>
                  <p>Version 2.0.0</p>
                  <p style={{ marginTop: '1rem', opacity: 0.7 }}>
                    Full control over users, hotels, trips, and system settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CLI Terminal Modal */}
      {cliOpen && (
        <div style={styles.cliOverlay} onClick={() => setCliOpen(false)}>
          <div style={styles.cliContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.cliHeader}>
              <div style={styles.cliTitle}>
                <Terminal size={18} />
                <span>Admin CLI</span>
              </div>
              <button onClick={() => setCliOpen(false)} style={styles.cliClose}>
                <X size={18} />
              </button>
            </div>

            <div ref={cliOutputRef} style={styles.cliOutput}>
              {cliHistory.map((item, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.cliLine,
                    color: item.type === 'command' ? '#10b981' :
                           item.type === 'error' ? '#ef4444' :
                           item.type === 'success' ? '#10b981' :
                           item.type === 'system' ? '#f59e0b' : '#e5e7eb'
                  }}
                >
                  {item.text}
                </div>
              ))}
            </div>

            <div style={styles.cliInputContainer}>
              <span style={styles.cliPrompt}>admin@hop:~$</span>
              <input
                ref={cliInputRef}
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                onKeyDown={handleCliKeyDown}
                style={styles.cliInput}
                placeholder="Type a command..."
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalType === 'hotel' && (editingItem ? 'Edit Hotel' : 'Add Hotel')}
                {modalType === 'trip' && (editingItem ? 'Edit Trip' : 'Add Trip')}
                {modalType === 'password' && 'Reset Password'}
                {modalType === 'userDetails' && 'User Details'}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Hotel Form */}
              {modalType === 'hotel' && (
                <form onSubmit={handleSaveHotel} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hotel Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price/Night ($)</label>
                      <input
                        type="number"
                        value={formData.pricePerNight || ''}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Available Rooms</label>
                      <input
                        type="number"
                        value={formData.availableRooms || formData.roomsAvailable || ''}
                        onChange={(e) => setFormData({ ...formData, availableRooms: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Rating (0-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating || ''}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Amenities (comma separated)</label>
                    <input
                      type="text"
                      value={formData.amenities || ''}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      style={styles.input}
                      placeholder="WiFi, Pool, Gym, Spa"
                    />
                  </div>
                  <div style={styles.modalActions}>
                    <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" style={styles.submitBtn}>
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {/* Trip Form */}
              {modalType === 'trip' && (
                <form onSubmit={handleSaveTrip} style={styles.form}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Origin</label>
                      <input
                        type="text"
                        value={formData.origin || ''}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Destination</label>
                      <input
                        type="text"
                        value={formData.destination || ''}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Departure</label>
                      <input
                        type="datetime-local"
                        value={formData.departureTime || ''}
                        onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Arrival</label>
                      <input
                        type="datetime-local"
                        value={formData.arrivalTime || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Transport Type</label>
                    <select
                      value={formData.transportType || 'flight'}
                      onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                      style={styles.input}
                    >
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                    </select>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price ($)</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Available Seats</label>
                      <input
                        type="number"
                        value={formData.availableSeats || ''}
                        onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Carrier</label>
                    <input
                      type="text"
                      value={formData.carrier || ''}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.modalActions}>
                    <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" style={styles.submitBtn}>
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {/* Password Reset */}
              {modalType === 'password' && (
                <div>
                  <p style={{ marginBottom: '1rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Reset password for <strong>{formData.userName}</strong>
                  </p>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword || ''}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      style={styles.input}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div style={styles.modalActions}>
                    <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResetPassword(formData.userId, formData.newPassword)}
                      style={styles.submitBtn}
                      disabled={!formData.newPassword || formData.newPassword.length < 8}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              )}

              {/* User Details */}
              {modalType === 'userDetails' && formData && (
                <div style={styles.userDetails}>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>Name</span>
                    <span style={styles.userDetailValue}>{formData.name}</span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>Email</span>
                    <span style={styles.userDetailValue}>{formData.email}</span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>Role</span>
                    <span style={{
                      ...styles.badge,
                      background: formData.role === 'admin' ? '#10b981' : '#6b7280'
                    }}>
                      {formData.role}
                    </span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>Verified</span>
                    <span style={styles.userDetailValue}>
                      {formData.isVerified ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                    </span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>2FA</span>
                    <span style={styles.userDetailValue}>
                      {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>Phone</span>
                    <span style={styles.userDetailValue}>{formData.phone || 'Not set'}</span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>Created</span>
                    <span style={styles.userDetailValue}>
                      {new Date(formData.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.userDetailRow}>
                    <span style={styles.userDetailLabel}>User ID</span>
                    <span style={{ ...styles.userDetailValue, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {formData._id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add global styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .admin-dark-mode {
          background: #0a0a0a;
        }
      `}</style>
    </div>
  );
}

// Dynamic styles based on dark mode
function getStyles(darkMode) {
  const colors = {
    bg: darkMode ? '#0a0a0a' : '#f9fafb',
    surface: darkMode ? '#1a1a2e' : '#ffffff',
    surfaceHover: darkMode ? '#252540' : '#f3f4f6',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    text: darkMode ? '#ffffff' : '#1f2937',
    textSecondary: darkMode ? '#9ca3af' : '#6b7280',
    primary: '#10b981',
    primaryHover: '#059669',
  };

  return {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
    },

    // Sidebar
    sidebar: {
      width: '260px',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 100,
    },
    sidebarHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#10b981',
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#ffffff',
    },
    nav: {
      flex: 1,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      background: 'transparent',
      border: 'none',
      borderRadius: '10px',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
    },
    navButtonActive: {
      background: 'rgba(16, 185, 129, 0.2)',
      color: '#10b981',
    },
    sidebarFooter: {
      padding: '1rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    cliButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem',
      background: 'rgba(16, 185, 129, 0.2)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '8px',
      color: '#10b981',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem',
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      color: '#ef4444',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    // Main Content
    main: {
      flex: 1,
      marginLeft: '260px',
      display: 'flex',
      flexDirection: 'column',
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    },
    topBarLeft: {},
    topBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    pageTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: 0,
    },
    iconButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      background: colors.surfaceHover,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      color: colors.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    adminBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.375rem 0.75rem',
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '20px',
      color: '#10b981',
      fontSize: '0.75rem',
      fontWeight: '600',
    },

    // Notifications
    errorNotification: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '1rem 2rem 0',
      padding: '0.875rem 1rem',
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '10px',
      color: '#ef4444',
    },
    successNotification: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '1rem 2rem 0',
      padding: '0.875rem 1rem',
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '10px',
      color: '#10b981',
    },
    closeNotification: {
      marginLeft: 'auto',
      background: 'none',
      border: 'none',
      color: 'inherit',
      cursor: 'pointer',
      padding: '0.25rem',
    },

    // Content
    content: {
      flex: 1,
      padding: '2rem',
    },

    // Dashboard
    dashboard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.5rem',
    },
    statCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.5rem',
      borderRadius: '16px',
      color: '#ffffff',
    },
    statIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '56px',
      height: '56px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
    },
    statInfo: {},
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      lineHeight: 1.2,
    },
    statLabel: {
      fontSize: '0.875rem',
      opacity: 0.9,
    },

    // Section
    section: {
      background: colors.surface,
      borderRadius: '16px',
      padding: '1.5rem',
      border: `1px solid ${colors.border}`,
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1.25rem',
      color: colors.text,
    },

    // Health Grid
    healthGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
    },
    healthCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      background: colors.surfaceHover,
      borderRadius: '10px',
      border: `1px solid ${colors.border}`,
    },
    healthIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
    },
    healthInfo: {
      flex: 1,
    },
    healthService: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: colors.textSecondary,
    },
    healthStatus: {
      fontSize: '0.875rem',
      fontWeight: '600',
    },

    // Quick Actions
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
    },
    quickActionBtn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1.25rem',
      background: colors.surfaceHover,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      color: colors.text,
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    // Recent List
    recentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    recentItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem',
      background: colors.surfaceHover,
      borderRadius: '10px',
    },
    recentAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: '600',
    },
    recentInfo: {
      flex: 1,
    },
    recentName: {
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    recentEmail: {
      fontSize: '0.8rem',
      color: colors.textSecondary,
    },
    roleBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#ffffff',
      textTransform: 'capitalize',
    },

    // Toolbar
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    },
    searchBox: {
      flex: 1,
      minWidth: '200px',
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.textSecondary,
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      fontSize: '0.9rem',
      color: colors.text,
      outline: 'none',
    },
    filterSelect: {
      padding: '0.75rem 1rem',
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      fontSize: '0.9rem',
      color: colors.text,
      outline: 'none',
      cursor: 'pointer',
    },
    resultCount: {
      fontSize: '0.875rem',
      color: colors.textSecondary,
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: '10px',
      color: '#ffffff',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    // Table
    tableContainer: {
      background: colors.surface,
      borderRadius: '16px',
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
    },
    tableHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      background: colors.surfaceHover,
      fontWeight: '600',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: colors.textSecondary,
      borderBottom: `1px solid ${colors.border}`,
    },
    tableRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: `1px solid ${colors.border}`,
      transition: 'background 0.2s ease',
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.9rem',
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    userName: {
      fontWeight: '600',
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.625rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#ffffff',
      textTransform: 'capitalize',
    },
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      background: '#3b82f6',
      border: 'none',
      borderRadius: '6px',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: colors.textSecondary,
    },
    moreInfo: {
      padding: '1rem',
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: '0.875rem',
    },

    // Settings
    settingsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '600px',
    },
    settingsSection: {
      background: colors.surface,
      borderRadius: '16px',
      padding: '1.5rem',
      border: `1px solid ${colors.border}`,
    },
    settingsSectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: colors.text,
    },
    settingItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: `1px solid ${colors.border}`,
    },
    settingInfo: {},
    settingLabel: {
      fontWeight: '500',
      marginBottom: '0.25rem',
    },
    settingDescription: {
      fontSize: '0.8rem',
      color: colors.textSecondary,
    },
    toggleButton: {
      width: '48px',
      height: '24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s ease',
    },
    toggleKnob: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      background: '#ffffff',
      borderRadius: '50%',
      transition: 'transform 0.2s ease',
    },
    settingButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: colors.surfaceHover,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      color: colors.text,
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
    aboutInfo: {
      color: colors.textSecondary,
      lineHeight: 1.6,
    },

    // CLI Terminal
    cliOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    cliContainer: {
      width: '100%',
      maxWidth: '800px',
      height: '500px',
      background: '#0d1117',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid #30363d',
    },
    cliHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      background: '#161b22',
      borderBottom: '1px solid #30363d',
    },
    cliTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#10b981',
      fontWeight: '600',
    },
    cliClose: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      background: 'transparent',
      border: 'none',
      borderRadius: '6px',
      color: '#8b949e',
      cursor: 'pointer',
    },
    cliOutput: {
      flex: 1,
      padding: '1rem',
      overflow: 'auto',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    cliLine: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    },
    cliInputContainer: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      background: '#161b22',
      borderTop: '1px solid #30363d',
    },
    cliPrompt: {
      color: '#10b981',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: '0.875rem',
      marginRight: '0.5rem',
    },
    cliInput: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      color: '#e5e7eb',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: '0.875rem',
      outline: 'none',
    },

    // Modal
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    modal: {
      width: '100%',
      maxWidth: '500px',
      background: colors.surface,
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`,
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 1.5rem',
      borderBottom: `1px solid ${colors.border}`,
    },
    modalTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: 0,
    },
    modalClose: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: colors.textSecondary,
      cursor: 'pointer',
    },
    modalBody: {
      padding: '1.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
    },
    label: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: colors.textSecondary,
    },
    input: {
      padding: '0.75rem',
      background: darkMode ? '#0f0f1a' : '#ffffff',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      fontSize: '0.9rem',
      color: colors.text,
      outline: 'none',
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem',
    },
    cancelBtn: {
      flex: 1,
      padding: '0.75rem',
      background: colors.surfaceHover,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      color: colors.text,
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    submitBtn: {
      flex: 1,
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
    },

    // User Details
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    userDetailRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.625rem 0',
      borderBottom: `1px solid ${colors.border}`,
    },
    userDetailLabel: {
      fontSize: '0.875rem',
      color: colors.textSecondary,
    },
    userDetailValue: {
      fontWeight: '500',
    },
  };
}

export default AdminDashboard;
