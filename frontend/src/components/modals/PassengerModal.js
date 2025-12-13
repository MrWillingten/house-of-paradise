import React from 'react';
import { X } from 'lucide-react';

const PassengerModal = ({ isOpen, onClose, passengers, setPassengers, darkMode }) => {
  if (!isOpen) return null;

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
          <h2>Passengers</h2>
          <button
            onClick={onClose}
            className="clickable modal-close"
            style={styles.closeButton}
          >
            <X size={24} />
          </button>
        </div>

        <div style={styles.passengerContent}>
          {/* Adults */}
          <div style={styles.passengerRow}>
            <div>
              <div style={styles.passengerLabel}>Adults</div>
              <div style={styles.passengerSub}>16+ years</div>
            </div>
            <div style={styles.passengerControls}>
              <button
                onClick={() =>
                  setPassengers({ ...passengers, adults: Math.max(1, passengers.adults - 1) })
                }
                className="clickable btn-3d-small"
                style={styles.controlButton}
              >
                -
              </button>
              <span style={styles.passengerCount}>{passengers.adults}</span>
              <button
                onClick={() => setPassengers({ ...passengers, adults: passengers.adults + 1 })}
                className="clickable btn-3d-small"
                style={styles.controlButton}
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div style={styles.passengerRow}>
            <div>
              <div style={styles.passengerLabel}>Children</div>
              <div style={styles.passengerSub}>0-15 years</div>
            </div>
            <div style={styles.passengerControls}>
              <button
                onClick={() =>
                  setPassengers({
                    ...passengers,
                    children: Math.max(0, passengers.children - 1),
                  })
                }
                className="clickable btn-3d-small"
                style={styles.controlButton}
              >
                -
              </button>
              <span style={styles.passengerCount}>{passengers.children}</span>
              <button
                onClick={() =>
                  setPassengers({ ...passengers, children: passengers.children + 1 })
                }
                className="clickable btn-3d-small"
                style={styles.controlButton}
              >
                +
              </button>
            </div>
          </div>
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
    maxWidth: '450px',
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
  passengerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  passengerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  passengerLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  passengerSub: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginTop: '0.25rem',
  },
  passengerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  controlButton: {
    padding: '0.5rem 1.25rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
  },
  passengerCount: {
    fontSize: '1.2rem',
    fontWeight: '600',
    minWidth: '30px',
    textAlign: 'center',
  },
};

export default PassengerModal;
