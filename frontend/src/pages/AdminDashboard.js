import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelService, tripService, authService, adminService } from '../services/api';
import { Plus, Edit2, Trash2, Hotel, Plane, LogOut, Users, BarChart3, Terminal, Shield, ShieldOff, Key, UserX } from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [hotels, setHotels] = useState([]);
  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordModal, setPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!authService.isAdmin()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'hotels') {
        const response = await hotelService.getAll();
        setHotels(response.data.data);
      } else if (activeTab === 'trips') {
        const response = await tripService.getAll();
        setTrips(response.data.data);
      } else if (activeTab === 'users') {
        const response = await adminService.getAllUsers();
        setUsers(response.data.data);
      } else if (activeTab === 'stats') {
        const [statsRes, hotelsRes, tripsRes, usersRes] = await Promise.all([
          adminService.getStats(),
          hotelService.getAll(),
          tripService.getAll(),
          adminService.getAllUsers()
        ]);
        setStats({
          ...statsRes.data.data,
          totalHotels: hotelsRes.data.data.length,
          totalTrips: tripsRes.data.data?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handlePromote = async (userId) => {
    if (!window.confirm('Promote this user to admin?')) return;
    try {
      await adminService.promoteUser(userId);
      fetchData();
      alert('User promoted to admin!');
    } catch (error) {
      alert('Failed to promote user: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDemote = async (userId) => {
    if (!window.confirm('Demote this admin to regular user?')) return;
    try {
      await adminService.demoteUser(userId);
      fetchData();
      alert('Admin demoted to user!');
    } catch (error) {
      alert('Failed to demote user: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      fetchData();
      alert('User deleted successfully!');
    } catch (error) {
      alert('Failed to delete user: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    try {
      await adminService.resetPassword(passwordModal, newPassword);
      setPasswordModal(null);
      setNewPassword('');
      alert('Password reset successfully!');
    } catch (error) {
      alert('Failed to reset password: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(activeTab === 'hotels' ? {
      name: '',
      location: '',
      pricePerNight: '',
      availableRooms: '',
      rating: '',
      amenities: '',
    } : {
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      transportType: 'flight',
      price: '',
      availableSeats: '',
      carrier: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'hotels') {
      setFormData({
        ...item,
        amenities: item.amenities?.join(', ') || '',
      });
    } else {
      setFormData(item);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'hotels') {
        await hotelService.delete(id);
      } else {
        await tripService.delete(id);
      }
      fetchData();
      alert('Deleted successfully!');
    } catch (error) {
      alert('Failed to delete: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {...formData};

      if (activeTab === 'hotels') {
        payload.amenities = payload.amenities.split(',').map(a => a.trim()).filter(Boolean);
        payload.pricePerNight = Number(payload.pricePerNight);
        payload.availableRooms = Number(payload.availableRooms);
        payload.rating = Number(payload.rating);

        if (editingItem) {
          await hotelService.update(editingItem._id, payload);
        } else {
          await hotelService.create(payload);
        }
      } else {
        payload.price = Number(payload.price);
        payload.availableSeats = Number(payload.availableSeats);

        if (editingItem) {
          await tripService.update(editingItem.id, payload);
        } else {
          await tripService.create(payload);
        }
      }

      setShowModal(false);
      fetchData();
      alert(editingItem ? 'Updated successfully!' : 'Created successfully!');
    } catch (error) {
      alert('Failed to save: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const renderStats = () => (
    <div style={styles.statsContainer}>
      <h2 style={styles.sectionTitle}>System Overview</h2>

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <Users size={40} color="white" />
          <div style={styles.statNumber}>{stats?.totalUsers || 0}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>

        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <Shield size={40} color="white" />
          <div style={styles.statNumber}>{stats?.totalAdmins || 0}</div>
          <div style={styles.statLabel}>Admins</div>
        </div>

        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
          <Hotel size={40} color="white" />
          <div style={styles.statNumber}>{stats?.totalHotels || 0}</div>
          <div style={styles.statLabel}>Hotels</div>
        </div>

        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
          <Plane size={40} color="white" />
          <div style={styles.statNumber}>{stats?.totalTrips || 0}</div>
          <div style={styles.statLabel}>Trips</div>
        </div>
      </div>

      <div style={styles.cliSection}>
        <h3 style={styles.sectionTitle}>
          <Terminal size={24} style={{marginRight: '0.5rem'}} />
          Admin CLI Access
        </h3>
        <div style={styles.cliInstructions}>
          <p style={styles.cliText}>For advanced database operations, use the Admin CLI tool:</p>
          <div style={styles.codeBlock}>
            <code>cd scripts</code><br/>
            <code>node admin-cli.js</code>
          </div>
          <p style={styles.cliText}>Login with your admin credentials to access:</p>
          <ul style={styles.featureList}>
            <li>User management (promote, demote, delete, reset passwords)</li>
            <li>Hotel & Trip database operations</li>
            <li>System statistics and monitoring</li>
            <li>Bulk operations and advanced queries</li>
          </ul>
          <div style={styles.warningBox}>
            ⚠️ <strong>Security Note:</strong> CLI provides direct database access. Only authorized personnel should use it.
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div style={styles.table}>
        <div style={styles.tableHeaderUsers}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        {users.map((user) => (
          <div key={user._id} style={styles.tableRow}>
            <div>{user.name}</div>
            <div>{user.email}</div>
            <div>
              <span style={user.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                {user.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
            <div>{new Date(user.createdAt).toLocaleDateString()}</div>
            <div style={styles.actions}>
              {user.role === 'admin' ? (
                <button onClick={() => handleDemote(user._id)} style={styles.demoteButton} title="Demote to User">
                  <ShieldOff size={16} />
                </button>
              ) : (
                <button onClick={() => handlePromote(user._id)} style={styles.promoteButton} title="Promote to Admin">
                  <Shield size={16} />
                </button>
              )}
              <button onClick={() => setPasswordModal(user._id)} style={styles.passwordButton} title="Reset Password">
                <Key size={16} />
              </button>
              <button onClick={() => handleDeleteUser(user._id)} style={styles.deleteButton} title="Delete User">
                <UserX size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Admin Panel</h2>

        <button
          onClick={() => setActiveTab('stats')}
          style={{...styles.sidebarButton, ...(activeTab === 'stats' ? styles.sidebarButtonActive : {})}}
        >
          <BarChart3 size={20} />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{...styles.sidebarButton, ...(activeTab === 'users' ? styles.sidebarButtonActive : {})}}
        >
          <Users size={20} />
          Users
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          style={{...styles.sidebarButton, ...(activeTab === 'hotels' ? styles.sidebarButtonActive : {})}}
        >
          <Hotel size={20} />
          Hotels
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          style={{...styles.sidebarButton, ...(activeTab === 'trips' ? styles.sidebarButtonActive : {})}}
        >
          <Plane size={20} />
          Trips
        </button>

        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {activeTab === 'stats' && 'Dashboard'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'hotels' && 'Manage Hotels'}
            {activeTab === 'trips' && 'Manage Trips'}
          </h1>
          {(activeTab === 'hotels' || activeTab === 'trips') && (
            <button onClick={handleAdd} style={styles.addButton}>
              <Plus size={20} />
              Add {activeTab === 'hotels' ? 'Hotel' : 'Trip'}
            </button>
          )}
        </div>

        <div style={styles.content}>
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'hotels' && (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div>Name</div>
                <div>Location</div>
                <div>Price</div>
                <div>Rooms</div>
                <div>Rating</div>
                <div>Actions</div>
              </div>
              {hotels.map((hotel) => (
                <div key={hotel._id} style={styles.tableRow}>
                  <div>{hotel.name}</div>
                  <div>{hotel.location}</div>
                  <div>${hotel.pricePerNight}</div>
                  <div>{hotel.availableRooms}</div>
                  <div>⭐{hotel.rating}</div>
                  <div style={styles.actions}>
                    <button onClick={() => handleEdit(hotel)} style={styles.editButton}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(hotel._id)} style={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'trips' && (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div>Route</div>
                <div>Type</div>
                <div>Departure</div>
                <div>Price</div>
                <div>Seats</div>
                <div>Actions</div>
              </div>
              {trips.map((trip) => (
                <div key={trip.id} style={styles.tableRow}>
                  <div>{trip.origin} → {trip.destination}</div>
                  <div>{trip.transportType}</div>
                  <div>{new Date(trip.departureTime).toLocaleString()}</div>
                  <div>${trip.price}</div>
                  <div>{trip.availableSeats}</div>
                  <div style={styles.actions}>
                    <button onClick={() => handleEdit(trip)} style={styles.editButton}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(trip.id)} style={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      {passwordModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Reset User Password</h2>
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalButtons}>
              <button onClick={() => { setPasswordModal(null); setNewPassword(''); }} style={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleResetPassword} style={styles.saveButton}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel/Trip Edit Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'hotels' ? 'Hotel' : 'Trip'}
            </h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              {activeTab === 'hotels' ? (
                <>
                  <input placeholder="Hotel Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
                  <input placeholder="Location" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} style={styles.input} required />
                  <input type="number" placeholder="Price Per Night" value={formData.pricePerNight || ''} onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})} style={styles.input} required />
                  <input type="number" placeholder="Available Rooms" value={formData.availableRooms || ''} onChange={(e) => setFormData({...formData, availableRooms: e.target.value})} style={styles.input} required />
                  <input type="number" step="0.1" placeholder="Rating (0-5)" value={formData.rating || ''} onChange={(e) => setFormData({...formData, rating: e.target.value})} style={styles.input} required />
                  <input placeholder="Amenities (comma separated)" value={formData.amenities || ''} onChange={(e) => setFormData({...formData, amenities: e.target.value})} style={styles.input} />
                </>
              ) : (
                <>
                  <input placeholder="Origin" value={formData.origin || ''} onChange={(e) => setFormData({...formData, origin: e.target.value})} style={styles.input} required />
                  <input placeholder="Destination" value={formData.destination || ''} onChange={(e) => setFormData({...formData, destination: e.target.value})} style={styles.input} required />
                  <input type="datetime-local" placeholder="Departure Time" value={formData.departureTime || ''} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} style={styles.input} required />
                  <input type="datetime-local" placeholder="Arrival Time" value={formData.arrivalTime || ''} onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} style={styles.input} required />
                  <select value={formData.transportType || 'flight'} onChange={(e) => setFormData({...formData, transportType: e.target.value})} style={styles.input} required>
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                  </select>
                  <input type="number" placeholder="Price" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} style={styles.input} required />
                  <input type="number" placeholder="Available Seats" value={formData.availableSeats || ''} onChange={(e) => setFormData({...formData, availableSeats: e.target.value})} style={styles.input} required />
                  <input placeholder="Carrier" value={formData.carrier || ''} onChange={(e) => setFormData({...formData, carrier: e.target.value})} style={styles.input} required />
                </>
              )}

              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.saveButton}>{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f9fafb' },
  sidebar: { width: '250px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem 1rem', color: 'white', position: 'relative' },
  sidebarTitle: { fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' },
  sidebarButton: { width: '100%', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' },
  sidebarButtonActive: { background: 'rgba(255,255,255,0.2)', borderColor: 'white' },
  logoutButton: { width: '100%', background: 'rgba(239,68,68,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'absolute', bottom: '2rem', width: 'calc(250px - 2rem)' },
  main: { flex: 1, padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' },
  addButton: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  content: { background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },

  statsContainer: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' },
  statCard: { padding: '2rem', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  statNumber: { fontSize: '3rem', fontWeight: 'bold' },
  statLabel: { fontSize: '1rem', opacity: 0.9 },

  cliSection: { marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb' },
  cliInstructions: { marginTop: '1rem' },
  cliText: { marginBottom: '1rem', color: '#4b5563' },
  codeBlock: { background: '#1f2937', color: '#10b981', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', marginBottom: '1rem' },
  featureList: { paddingLeft: '1.5rem', color: '#4b5563' },
  warningBox: { marginTop: '1rem', padding: '1rem', background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', color: '#92400e' },

  table: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  tableHeader: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '1rem', background: '#f9fafb', fontWeight: 'bold', borderRadius: '8px' },
  tableHeaderUsers: { display: 'grid', gridTemplateColumns: '2fr 3fr 1.5fr 2fr 2fr', padding: '1rem', background: '#f9fafb', fontWeight: 'bold', borderRadius: '8px' },
  tableRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: '1rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center' },
  actions: { display: 'flex', gap: '0.5rem' },
  editButton: { background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  deleteButton: { background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  promoteButton: { background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  demoteButton: { background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  passwordButton: { background: '#8b5cf6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  adminBadge: { padding: '0.25rem 0.75rem', background: '#10b981', color: 'white', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 'bold' },
  userBadge: { padding: '0.25rem 0.75rem', background: '#6b7280', color: 'white', borderRadius: '12px', fontSize: '0.875rem' },

  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflow: 'auto' },
  modalTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', outline: 'none' },
  modalButtons: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  cancelButton: { flex: 1, background: '#f3f4f6', color: '#4b5563', border: 'none', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  saveButton: { flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
};

export default AdminDashboard;
