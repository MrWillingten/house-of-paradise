import React from 'react';
import { X, Search } from 'lucide-react';
import { destinations } from '../../data/destinations';

const LocationModal = ({ isOpen, onClose, onSelect, darkMode }) => {
  if (!isOpen) return null;

  const handleSelect = (destination) => {
    onSelect(destination);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={styles.overlay}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles.modal,
          background: darkMode ? '#1f2937' : 'white',
          color: darkMode ? '#e5e7eb' : '#1f2937',
        }}
      >
        <div style={styles.modalHeader}>
          <h2>Select Location</h2>
          <button
            onClick={onClose}
            className="clickable modal-close"
            style={styles.closeButton}
          >
            <X size={24} />
          </button>
        </div>

        <div style={styles.modalSearch}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search destination..."
            style={{
              ...styles.modalInput,
              background: darkMode ? '#111827' : 'white',
              color: darkMode ? '#e5e7eb' : '#1f2937',
            }}
          />
        </div>

        <div style={styles.flagGrid}>
          {destinations.map((dest, i) => (
            <div
              key={i}
              style={{
                ...styles.flagItem,
                background: darkMode ? '#111827' : '#f9fafb',
              }}
              onClick={() => handleSelect(dest.name)}
              className="clickable flag-item spotlight-card"
            >
              <span style={styles.flag}>{dest.flag}</span>
              <span>{dest.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
    backdropFilter: 'blur(4px)',
  },
  modal: {
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  modalSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    transition: 'all 0.3s',
  },
  modalInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
  },
  flagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
  },
  flagItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '12px',
    transition: 'all 0.2s',
    border: '2px solid transparent',
    position: 'relative',
    cursor: 'pointer',
  },
  flag: {
    fontSize: '2.5rem',
  },
};

export default LocationModal;
