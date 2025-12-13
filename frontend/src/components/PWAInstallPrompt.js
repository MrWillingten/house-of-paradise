import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ PWA already installed');
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSince < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e) => {
      console.log('🎯 PWA Install Prompt Available');
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show instructions after visits
    if (iOS) {
      const visitCount = parseInt(localStorage.getItem('visit-count') || '0');
      localStorage.setItem('visit-count', (visitCount + 1).toString());

      if (visitCount >= 2) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS - show instructions
      if (isIOS) {
        setShowIOSInstructions(true);
        return;
      }
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`🎯 User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ PWA installed!');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleIOSClose = () => {
    setShowIOSInstructions(false);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showPrompt) {
    return null;
  }

  // iOS Installation Instructions
  if (showIOSInstructions) {
    return (
      <div style={styles.overlay} onClick={handleIOSClose}>
        <div style={styles.iosModal} onClick={(e) => e.stopPropagation()}>
          <button onClick={handleIOSClose} style={styles.closeButton}>
            <X size={24} />
          </button>

          <div style={styles.iosIcon}>
            <Smartphone size={48} color="#10b981" />
          </div>

          <h2 style={styles.iosTitle}>Install House of Paradise</h2>
          <p style={styles.iosSubtitle}>Add to your home screen for quick access!</p>

          <div style={styles.iosSteps}>
            <div style={styles.iosStep}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepText}>
                Tap the <strong>Share</strong> button
                <div style={styles.shareIcon}>
                  <svg width="20" height="28" viewBox="0 0 20 28" fill="#007AFF">
                    <path d="M10 0L10 18M10 0L6 4M10 0L14 4M2 8v16c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4V8"/>
                  </svg>
                </div>
              </div>
            </div>

            <div style={styles.iosStep}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepText}>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </div>
            </div>

            <div style={styles.iosStep}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepText}>
                Tap <strong>"Add"</strong> in the top right corner
              </div>
            </div>
          </div>

          <button onClick={handleIOSClose} style={styles.iosButton} className="ios-got-it-btn">
            Got It!
          </button>
        </div>
      </div>
    );
  }

  // Standard Install Banner
  return (
    <div style={styles.banner}>
      <div style={styles.bannerContent}>
        <div style={styles.bannerLeft}>
          <div style={styles.appIcon}>
            <Download size={28} color="white" />
          </div>
          <div style={styles.bannerText}>
            <div style={styles.bannerTitle}>Install House of Paradise</div>
            <div style={styles.bannerSubtitle}>
              Get instant access and offline features!
            </div>
          </div>
        </div>

        <div style={styles.bannerActions}>
          <button onClick={handleInstall} style={styles.installButton} className="install-btn">
            {isIOS ? 'How to Install' : 'Install App'}
          </button>
          <button onClick={handleDismiss} style={styles.dismissButton} className="dismiss-btn">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    zIndex: 9999,
    animation: 'slideUp 0.5s ease-out',
  },
  bannerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '1.25rem 1.5rem',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  bannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
  },
  appIcon: {
    width: '56px',
    height: '56px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  bannerText: {
    color: 'white',
  },
  bannerTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    marginBottom: '0.25rem',
  },
  bannerSubtitle: {
    fontSize: '0.9rem',
    opacity: 0.95,
  },
  bannerActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  installButton: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: '#10b981',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  dismissButton: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)',
  },
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
    padding: '2rem',
  },
  iosModal: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    position: 'relative',
    animation: 'scaleIn 0.3s ease-out',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '36px',
    height: '36px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  iosIcon: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  iosTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  iosSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iosSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  iosStep: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: '1.6',
    flex: 1,
  },
  shareIcon: {
    display: 'inline-block',
    marginLeft: '0.5rem',
    verticalAlign: 'middle',
  },
  iosButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .install-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }

    .dismiss-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .ios-got-it-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    @media (max-width: 640px) {
      .bannerContent {
        flex-direction: column !important;
        align-items: stretch !important;
      }

      .bannerActions {
        flex-direction: column !important;
        width: 100%;
      }

      .installButton {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

export default PWAInstallPrompt;
