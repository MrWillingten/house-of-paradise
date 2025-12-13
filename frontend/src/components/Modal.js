import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  darkMode = false
}) => {
  // Close on ESC key
  const handleEscKey = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscKey]);

  // Handle click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size mappings
  const sizeStyles = {
    small: { maxWidth: '400px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '900px' }
  };

  return (
    <>
      <style>{modalStyles}</style>

      <div
        style={styles.overlay}
        onClick={handleOverlayClick}
        className="modal-overlay-fade"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          style={{
            ...styles.modal,
            ...sizeStyles[size],
            background: darkMode
              ? 'linear-gradient(135deg, #1f2937 0%, #1a1a2e 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            border: darkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #e5e7eb'
          }}
          className="modal-scale"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            ...styles.header,
            borderBottom: darkMode
              ? '2px solid rgba(255,255,255,0.1)'
              : '2px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h2
              id="modal-title"
              style={{
                ...styles.title,
                color: darkMode ? '#ffffff' : '#1f2937'
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                ...styles.closeButton,
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: darkMode ? '#e5e7eb' : '#6b7280'
              }}
              className="clickable modal-close-hover"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={styles.body}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

const modalStyles = `
  .modal-overlay-fade {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-scale {
    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-close-hover:hover {
    transform: rotate(90deg) scale(1.1);
  }

  .clickable {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .clickable:hover {
    opacity: 0.8;
  }

  .clickable:active {
    transform: scale(0.95);
  }
`;

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(8px)',
    padding: '1rem'
  },
  modal: {
    borderRadius: '24px',
    width: '90%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.75rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: 0
  },
  closeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    flexShrink: 0
  },
  body: {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1
  }
};

export default Modal;
