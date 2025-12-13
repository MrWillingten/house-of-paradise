import React, { useState } from 'react';
import { XCircle, X } from 'lucide-react';

const ErrorBanner = ({
  message,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match the slide-out animation duration
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{errorBannerStyles}</style>

      <div
        style={styles.banner}
        className={isExiting ? 'error-banner-slide-out' : 'error-banner-slide-in error-shake'}
        role="alert"
        aria-live="assertive"
      >
        <div style={styles.content}>
          {/* Icon */}
          <div style={styles.iconContainer}>
            <XCircle size={24} color="#ffffff" strokeWidth={2.5} />
          </div>

          {/* Message */}
          <div style={styles.message}>
            {message}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            style={styles.closeButton}
            className="clickable close-hover"
            aria-label="Close error notification"
          >
            <X size={20} color="#ffffff" />
          </button>
        </div>

        {/* Decorative border */}
        <div style={styles.bottomBorder} />
      </div>
    </>
  );
};

const errorBannerStyles = `
  .error-banner-slide-in {
    animation: errorSlideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes errorSlideDown {
    from {
      transform: translateY(-120%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .error-banner-slide-out {
    animation: errorSlideUp 0.3s ease-out;
  }

  @keyframes errorSlideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-120%);
      opacity: 0;
    }
  }

  .error-shake {
    animation: errorShake 0.5s ease 0.4s;
  }

  @keyframes errorShake {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-50%) translateX(-8px); }
    20%, 40%, 60%, 80% { transform: translateX(-50%) translateX(8px); }
  }

  .clickable {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .close-hover:hover {
    transform: rotate(90deg) scale(1.15);
    opacity: 0.9;
  }

  .close-hover:active {
    transform: rotate(90deg) scale(0.95);
  }
`;

const styles = {
  banner: {
    position: 'fixed',
    top: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    maxWidth: '600px',
    width: '90%',
    backdropFilter: 'blur(10px)'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    color: '#ffffff'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  message: {
    flex: 1,
    fontSize: '1rem',
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0.2px'
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease'
  },
  bottomBorder: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.3)',
    width: '100%'
  }
};

export default ErrorBanner;
