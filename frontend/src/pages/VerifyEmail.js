import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, RefreshCw, CheckCircle, AlertCircle, Sparkles, Shield, Zap, Star } from 'lucide-react';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Dark mode state - read from localStorage, default to false (light mode)
  const [darkMode] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.darkMode || false;
      } catch {
        return false;
      }
    }
    return false;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // On mount, force remove dark-mode if not set
  useEffect(() => {
    if (!darkMode) {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Get email from navigation state
  const email = location.state?.email || '';
  const userName = location.state?.name || '';
  const previewUrl = location.state?.previewUrl;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [inputRefs]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow alphanumeric characters
    if (!/^[A-Z0-9]?$/i.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pastedCode = text.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
        const newCode = pastedCode.split('').concat(Array(6).fill('')).slice(0, 6);
        setCode(newCode);

        // Focus last filled input or first empty
        const lastIndex = Math.min(pastedCode.length, 5);
        inputRefs[lastIndex].current?.focus();

        // Auto-submit if complete
        if (pastedCode.length === 6) {
          handleVerify(pastedCode);
        }
      });
    }
  };

  const handleVerify = async (verificationCode = null) => {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyEmail({
        email,
        code: codeToVerify
      });

      if (response.data.success) {
        setSuccess(true);

        // Save token and user
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Redirect after short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Verification failed. Please try again.';
      setError(errorMsg);

      // Update attempts remaining if provided
      if (err.response?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.response.data.attemptsRemaining);
      }

      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await authService.resendCode({
        email,
        type: 'email_verification'
      });

      if (response.data.success) {
        setResendCooldown(60); // 60 seconds cooldown
        setCode(['', '', '', '', '', '']);
        setAttemptsRemaining(null);
        inputRefs[0].current?.focus();

        // Show success message temporarily
        setError('');
        const successMsg = 'New code sent! Please check your email.';
        setError(successMsg);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend code. Please try again.';
      setError(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundGradient}></div>

        {/* Floating Success Particles */}
        <div className="floating-particles-success">
          <Sparkles style={{...styles.floatingParticle, top: '10%', left: '15%', animationDelay: '0s'}} size={24} color="#10b981" />
          <Star style={{...styles.floatingParticle, top: '20%', right: '20%', animationDelay: '0.5s'}} size={20} color="#fbbf24" />
          <Sparkles style={{...styles.floatingParticle, bottom: '15%', left: '25%', animationDelay: '1s'}} size={18} color="#10b981" />
          <Star style={{...styles.floatingParticle, bottom: '25%', right: '15%', animationDelay: '1.5s'}} size={22} color="#fbbf24" />
          <Zap style={{...styles.floatingParticle, top: '50%', left: '10%', animationDelay: '0.7s'}} size={20} color="#10b981" />
          <Zap style={{...styles.floatingParticle, top: '60%', right: '10%', animationDelay: '1.2s'}} size={18} color="#10b981" />
        </div>

        <div style={styles.successCard} className="verify-card success-pulse">
          <div className="confetti-burst">
            <Sparkles size={28} color="#10b981" style={{position: 'absolute', top: '-20px', left: '-20px'}} />
            <Star size={24} color="#fbbf24" style={{position: 'absolute', top: '-15px', right: '-15px'}} />
            <Sparkles size={20} color="#10b981" style={{position: 'absolute', bottom: '-10px', left: '50%'}} />
          </div>

          <div style={styles.successIconContainer} className="success-icon-pulse">
            <CheckCircle size={72} color="white" className="check-icon-spin" />
          </div>

          <h1 style={styles.successTitle} className="success-title-glow">
            Email Verified!
          </h1>

          <div style={styles.successBadge} className="badge-float">
            <Shield size={20} color="#10b981" />
            <span>Account Secured</span>
          </div>

          <p style={styles.successText}>
            Your account has been successfully verified.
          </p>
          <p style={styles.successSubtext}>
            Redirecting you to the homepage...
          </p>

          <div style={styles.loaderContainer}>
            <div style={styles.loader}></div>
            <Zap size={18} color="#10b981" style={{position: 'absolute'}} className="zap-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      {/* Floating Background Particles */}
      <div className="floating-particles">
        <Sparkles style={{...styles.floatingParticle, top: '15%', left: '10%', animationDelay: '0s'}} size={28} color="rgba(16, 185, 129, 0.3)" />
        <Star style={{...styles.floatingParticle, top: '25%', right: '15%', animationDelay: '1s'}} size={24} color="rgba(251, 191, 36, 0.4)" />
        <Shield style={{...styles.floatingParticle, top: '60%', left: '8%', animationDelay: '2s'}} size={26} color="rgba(16, 185, 129, 0.3)" />
        <Zap style={{...styles.floatingParticle, top: '70%', right: '12%', animationDelay: '1.5s'}} size={22} color="rgba(16, 185, 129, 0.4)" />
        <Sparkles style={{...styles.floatingParticle, bottom: '20%', left: '20%', animationDelay: '0.5s'}} size={20} color="rgba(16, 185, 129, 0.3)" />
        <Star style={{...styles.floatingParticle, bottom: '30%', right: '25%', animationDelay: '2.5s'}} size={18} color="rgba(251, 191, 36, 0.4)" />
      </div>

      <div style={styles.card} className="verify-card">
        <div style={styles.header}>
          <div style={styles.icon} className="icon-pulse-glow">
            <Mail size={32} />
            <Zap size={16} style={styles.iconBadge} className="badge-pulse" />
          </div>
          <h1 style={styles.title} className="title-shimmer">Verify Your Email</h1>

          <div style={styles.securityBadge} className="security-badge-float">
            <Shield size={18} color="#10b981" />
            <span>Secure Verification</span>
          </div>

          <p style={styles.subtitle}>
            We've sent a 6-character verification code to
          </p>
          <p style={styles.email}>{email}</p>
        </div>

        {previewUrl && (
          <div style={styles.devNote}>
            <AlertCircle size={16} />
            <span>Development Mode: <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>View Email</a></span>
          </div>
        )}

        {error && (
          <div style={error.includes('sent!') ? styles.successMessage : styles.errorBox} className="error-shake">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                ...styles.codeInput,
                ...(digit && styles.codeInputFilled)
              }}
              className="code-input-focus"
              disabled={loading || success}
            />
          ))}
        </div>

        {attemptsRemaining !== null && attemptsRemaining > 0 && (
          <div style={styles.warningBox}>
            <AlertCircle size={18} />
            <span>{attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining</span>
          </div>
        )}

        <button
          onClick={() => handleVerify()}
          disabled={loading || code.join('').length !== 6}
          style={styles.verifyButton}
          className="submit-btn-hover"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <button
          onClick={handleResendCode}
          disabled={resendLoading || resendCooldown > 0}
          style={styles.resendButton}
          className="resend-btn-hover"
        >
          <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : resendLoading
            ? 'Sending...'
            : 'Resend Code'
          }
        </button>

        <div style={styles.infoBox}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>💡</span>
            <span style={styles.infoText}>Check your spam folder if you don't see the email</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>⏱️</span>
            <span style={styles.infoText}>Code expires in 15 minutes</span>
          </div>
        </div>
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
    padding: '3rem',
    maxWidth: '540px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  icon: {
    width: '72px',
    height: '72px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    margin: '0 auto 1.5rem',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.75rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  email: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#10b981',
    marginTop: '0.5rem',
  },
  devNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '2px solid #fbbf24',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: '#92400e',
    fontWeight: '600',
  },
  previewLink: {
    color: '#10b981',
    textDecoration: 'underline',
    fontWeight: '700',
  },
  errorBox: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '2px solid #fca5a5',
    color: '#991b1b',
    padding: '1.2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
  successMessage: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    border: '2px solid #6ee7b7',
    color: '#065f46',
    padding: '1.2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
  warningBox: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '2px solid #fbbf24',
    color: '#92400e',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  codeInputContainer: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  codeInput: {
    width: '60px',
    height: '70px',
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    background: 'white',
  },
  codeInputFilled: {
    borderColor: '#10b981',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
  },
  verifyButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '1.1rem',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    position: 'relative',
  },
  dividerText: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.98)',
    padding: '0 1rem',
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  resendButton: {
    width: '100%',
    background: 'transparent',
    color: '#10b981',
    border: '2px solid #10b981',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
  },
  infoBox: {
    background: '#f9fafb',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  infoIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#4b5563',
    fontWeight: '500',
    lineHeight: '1.5',
  },
  successCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '4rem 3rem',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  successIconContainer: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 32px rgba(16, 185, 129, 0.5)',
  },
  successTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  successText: {
    fontSize: '1.15rem',
    color: '#1f2937',
    fontWeight: '600',
  },
  successSubtext: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  loader: {
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
  },
  loaderContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    padding: '0.5rem 1.25rem',
    borderRadius: '50px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#065f46',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    border: '2px solid rgba(16, 185, 129, 0.4)',
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    padding: '0.75rem 1.5rem',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#065f46',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
    border: '2px solid #10b981',
  },
  iconBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '50%',
    padding: '4px',
    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.5)',
  },
  floatingParticle: {
    position: 'absolute',
    animation: 'float 4s ease-in-out infinite',
    opacity: 0.6,
    pointerEvents: 'none',
  },
};

// Add dynamic styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .verify-card {
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

    .code-input-focus:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
      transform: scale(1.08);
    }

    .submit-btn-hover:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
    }

    .submit-btn-hover:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .submit-btn-hover:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .resend-btn-hover:hover:not(:disabled) {
      background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .resend-btn-hover:active:not(:disabled) {
      transform: translateY(0);
    }

    .resend-btn-hover:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-shake {
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    /* EPIC NEW ANIMATIONS */
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.4;
      }
      50% {
        transform: translateY(-30px) rotate(180deg);
        opacity: 0.8;
      }
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      }
      50% {
        box-shadow: 0 12px 36px rgba(16, 185, 129, 0.7),
                    0 0 40px rgba(16, 185, 129, 0.3);
      }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    @keyframes badge-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @keyframes badge-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.15);
        opacity: 0.8;
      }
    }

    @keyframes success-pulse-grow {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 30px 80px rgba(0,0,0,0.2);
      }
      50% {
        transform: scale(1.03);
        box-shadow: 0 35px 90px rgba(16, 185, 129, 0.3);
      }
    }

    @keyframes check-spin {
      0% {
        transform: rotate(0deg) scale(1);
      }
      50% {
        transform: rotate(180deg) scale(1.1);
      }
      100% {
        transform: rotate(360deg) scale(1);
      }
    }

    @keyframes confetti-pop {
      0% {
        transform: scale(0) translateY(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) translateY(-20px);
        opacity: 1;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }

    @keyframes zap-pulse {
      0%, 100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: scale(1.3) rotate(15deg);
        opacity: 0.7;
      }
    }

    @keyframes title-glow {
      0%, 100% {
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
      }
      50% {
        text-shadow: 0 0 20px rgba(16, 185, 129, 0.6),
                     0 0 30px rgba(16, 185, 129, 0.4);
      }
    }

    .icon-pulse-glow {
      animation: pulse-glow 3s ease-in-out infinite;
    }

    .title-shimmer {
      background: linear-gradient(90deg, #1a1a1a 0%, #10b981 50%, #1a1a1a 100%);
      background-size: 2000px 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .security-badge-float {
      animation: badge-float 2s ease-in-out infinite;
    }

    .badge-pulse {
      animation: badge-pulse 2s ease-in-out infinite;
    }

    .success-pulse {
      animation: success-pulse-grow 2s ease-in-out infinite;
    }

    .success-icon-pulse {
      animation: pulse-glow 2s ease-in-out infinite;
    }

    .check-icon-spin {
      animation: check-spin 2s ease-in-out;
    }

    .confetti-burst > * {
      animation: confetti-pop 0.8s ease-out;
    }

    .zap-pulse {
      animation: zap-pulse 1.5s ease-in-out infinite;
    }

    .success-title-glow {
      animation: title-glow 2s ease-in-out infinite;
    }

    .floating-particles > *,
    .floating-particles-success > * {
      animation: float 4s ease-in-out infinite;
    }

    /* Enhanced code input glow on focus */
    .code-input-focus:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2),
                  0 0 20px rgba(16, 185, 129, 0.4),
                  0 4px 12px rgba(16, 185, 129, 0.3) !important;
      transform: scale(1.08);
      background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%) !important;
    }

    /* Enhanced button hover with glow */
    .submit-btn-hover:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5),
                  0 0 40px rgba(16, 185, 129, 0.3);
    }

    .resend-btn-hover:hover:not(:disabled) {
      background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3),
                  0 0 20px rgba(16, 185, 129, 0.2);
    }
  `;
  document.head.appendChild(style);
}

export default VerifyEmail;
