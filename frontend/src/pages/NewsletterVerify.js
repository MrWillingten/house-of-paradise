import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

function NewsletterVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token');
      return;
    }

    verifySubscription();
  }, [token]);

  const verifySubscription = async () => {
    try {
      const response = await axios.get(`/api/newsletter/verify/${token}`);

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setEmail(response.data.email);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to verify subscription. The link may be invalid or expired.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.card} className="newsletter-verify-card">
        {status === 'loading' && (
          <>
            <div style={styles.icon}>
              <Mail size={48} />
            </div>
            <h1 style={styles.title}>Verifying Your Subscription...</h1>
            <div style={styles.loader}></div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>
              <CheckCircle size={72} color="white" />
            </div>
            <h1 style={styles.successTitle}>Subscription Confirmed!</h1>
            <p style={styles.successText}>{message}</p>
            {email && <p style={styles.email}>{email}</p>}

            <div style={styles.benefitsBox}>
              <h3 style={styles.benefitsTitle}>What you'll receive:</h3>
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>
                  <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>Exclusive hotel and flight deals</span>
                </li>
                <li style={styles.benefitItem}>
                  <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>Early access to promotions</span>
                </li>
                <li style={styles.benefitItem}>
                  <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>Travel tips and destination guides</span>
                </li>
                <li style={styles.benefitItem}>
                  <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>Special member-only discounts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              style={styles.homeButton}
              className="submit-btn-hover"
            >
              <span>Go to Homepage</span>
              <ArrowRight size={20} />
            </button>

            <p style={styles.unsubscribeText}>
              You can unsubscribe anytime from the emails we send.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>
              <AlertCircle size={72} color="white" />
            </div>
            <h1 style={styles.errorTitle}>Verification Failed</h1>
            <p style={styles.errorText}>{message}</p>

            <button
              onClick={() => navigate('/')}
              style={styles.backButton}
              className="back-btn-hover"
            >
              <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
              <span>Back to Homepage</span>
            </button>

            <p style={styles.helpText}>
              Need help? Contact us at support@travelbooking.com
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    zIndex: 0,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3.5rem',
    maxWidth: '580px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(16, 185, 129, 0.2)',
    textAlign: 'center',
  },
  icon: {
    width: '96px',
    height: '96px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    margin: '0 auto 2rem',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
  },
  successIcon: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    boxShadow: '0 12px 32px rgba(16, 185, 129, 0.5)',
  },
  errorIcon: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    boxShadow: '0 12px 32px rgba(239, 68, 68, 0.5)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
  },
  successTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
  },
  errorTitle: {
    fontSize: '2.3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
  },
  successText: {
    fontSize: '1.15rem',
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  errorText: {
    fontSize: '1.05rem',
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  email: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '2rem',
  },
  loader: {
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '2rem auto',
  },
  benefitsBox: {
    background: '#f9fafb',
    padding: '2rem',
    borderRadius: '16px',
    border: '2px solid #e5e7eb',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  benefitsTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    color: '#374151',
    fontWeight: '500',
  },
  homeButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '1.1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  backButton: {
    width: '100%',
    background: 'transparent',
    color: '#10b981',
    border: '2px solid #10b981',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  unsubscribeText: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    fontWeight: '500',
  },
  helpText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
};

// Add dynamic styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .newsletter-verify-card {
      animation: fadeInScale 0.6s ease;
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .submit-btn-hover:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
    }

    .submit-btn-hover:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .back-btn-hover:hover {
      background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .back-btn-hover:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

export default NewsletterVerify;
