import React, { useState } from 'react';
import { Mail, CheckCircle, X } from 'lucide-react';

const Newsletter = ({ darkMode }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 3000);
      return;
    }

    setNewsletterStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(''), 8000);
      } else {
        setNewsletterStatus('error');
        setTimeout(() => setNewsletterStatus(''), 3000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 3000);
    }
  };

  return (
    <section
      style={{
        ...styles.section,
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }}
    >
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.icon}>
            <Mail size={48} color="white" />
          </div>

          <h2 style={styles.title}>Get Exclusive Travel Deals</h2>
          <p style={styles.subtitle}>
            Subscribe to our newsletter and never miss out on amazing offers. We send only the best
            deals - no spam!
          </p>

          <form onSubmit={handleNewsletterSubmit} style={styles.form}>
            <div style={styles.inputContainer}>
              <Mail
                size={20}
                color={darkMode ? '#9ca3af' : '#6b7280'}
                style={styles.inputIcon}
              />
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  ...styles.input,
                  background: darkMode ? '#1e293b' : 'white',
                  color: darkMode ? '#ffffff' : '#1f2937',
                }}
                disabled={newsletterStatus === 'loading'}
              />
            </div>

            <button
              type="submit"
              className="clickable"
              style={{
                ...styles.button,
                opacity: newsletterStatus === 'loading' ? 0.7 : 1,
              }}
              disabled={newsletterStatus === 'loading'}
            >
              {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </form>

          {newsletterStatus === 'success' && (
            <div style={styles.success}>
              <CheckCircle size={20} />
              <span>Success! Check your inbox for a confirmation email.</span>
            </div>
          )}

          {newsletterStatus === 'error' && (
            <div style={styles.error}>
              <X size={20} />
              <span>Please enter a valid email address.</span>
            </div>
          )}

          <p style={styles.privacy}>🔒 We respect your privacy. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '6rem 2rem',
    transition: 'background 1.2s ease',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    textAlign: 'center',
  },
  icon: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.15rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '3rem',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '600px',
    margin: '0 auto 2rem',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1.5rem',
  },
  input: {
    flex: 1,
    padding: '1.25rem 1.5rem 1.25rem 3.5rem',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '1.25rem 2rem',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '2px solid rgba(16, 185, 129, 0.4)',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '2px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  privacy: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
  },
};

export default Newsletter;
