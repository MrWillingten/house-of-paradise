import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessBanner = ({
  message,
  onClose,
  duration = 10000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

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
      <style>{successBannerStyles}</style>

      <div
        style={styles.banner}
        className={isExiting ? 'banner-slide-out' : 'banner-slide-in'}
        role="alert"
        aria-live="polite"
      >
        <div style={styles.content}>
          {/* Icon */}
          <div style={styles.iconContainer}>
            <CheckCircle size={24} color="#ffffff" strokeWidth={2.5} />
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
            aria-label="Close notification"
          >
            <X size={20} color="#ffffff" />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div
            style={styles.progressFill}
            className="progress-animation"
          />
        </div>
      </div>
    </>
  );
};

const successBannerStyles = `
  .banner-slide-in {
    animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideDown {
    from {
      transform: translateY(-120%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .banner-slide-out {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-120%);
      opacity: 0;
    }
  }

  .progress-animation {
    animation: progressShrink 10s linear forwards;
  }

  @keyframes progressShrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
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
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
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
    animation: 'bounce 0.6s ease-out'
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
  progressBar: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    width: '100%'
  },
  progressFill: {
    height: '100%',
    background: 'rgba(255, 255, 255, 0.5)',
    transition: 'width 0.1s linear'
  }
};

export default SuccessBanner;
