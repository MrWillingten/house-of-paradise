import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Home, FileText, Sparkles, Award, MapPin, Calendar,
  Clock, CreditCard, Mail, Phone, User, Star, Download, Share2,
  Copy, Bed, Building2
} from 'lucide-react';

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, payment, type, hotel, bookingDetails, pointsRedeemed, totalPrice, loyalty } = location.state || {};

  // Dark mode support
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

  const [copied, setCopied] = useState(false);

  // Use points earned from loyalty response, or calculate locally as fallback
  const finalAmount = totalPrice?.total || booking?.totalPrice || 0;
  const pointsEarned = loyalty?.pointsEarned || Math.floor(finalAmount * 10);
  const actualPointsRedeemed = loyalty?.pointsRedeemed || pointsRedeemed || 0;

  const copyBookingId = () => {
    const bookingId = booking?._id || booking?.id || 'N/A';
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styles = getStyles(darkMode);

  if (!booking) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>
          <h2 style={styles.errorTitle}>No Booking Found</h2>
          <p style={styles.errorText}>
            We couldn't find your booking information. This might happen if you refreshed the page.
          </p>
          <div style={styles.errorActions}>
            <button onClick={() => navigate('/')} style={styles.homeBtn}>
              <Home size={20} />
              Go Home
            </button>
            <button onClick={() => navigate('/bookings')} style={styles.bookingsBtn}>
              <FileText size={20} />
              My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Success Header */}
      <div style={styles.header}>
        <div style={styles.successIconContainer}>
          <div style={styles.successIconPulse}></div>
          <div style={styles.successIcon}>
            <CheckCircle size={56} />
          </div>
        </div>
        <h1 style={styles.title}>Booking Confirmed!</h1>
        <p style={styles.subtitle}>
          Your {type || 'hotel'} reservation has been successfully completed
        </p>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Booking Reference Card */}
        <div style={styles.referenceCard}>
          <div style={styles.referenceHeader}>
            <span style={styles.referenceLabel}>Booking Reference</span>
            <button onClick={copyBookingId} style={styles.copyBtn}>
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={styles.referenceId}>
            {booking._id || booking.id || 'HOP-' + Date.now()}
          </div>
          <div style={styles.referenceStatus}>
            <div style={styles.statusBadge}>
              <CheckCircle size={14} />
              {booking.status || 'Confirmed'}
            </div>
          </div>
        </div>

        <div style={styles.cardsGrid}>
          {/* Hotel Details Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Building2 size={20} style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Hotel Details</h3>
            </div>
            <div style={styles.hotelInfo}>
              {hotel?.images?.[0] && (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  style={styles.hotelImage}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop';
                  }}
                />
              )}
              <div style={styles.hotelDetails}>
                <h4 style={styles.hotelName}>{hotel?.name || booking.hotelName}</h4>
                <div style={styles.hotelLocation}>
                  <MapPin size={14} />
                  {hotel?.location || hotel?.city || 'Location'}
                </div>
                {hotel?.rating && (
                  <div style={styles.hotelRating}>
                    <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                    {hotel.rating.toFixed(1)}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <Calendar size={16} style={styles.detailIcon} />
                <div>
                  <span style={styles.detailLabel}>Check-in</span>
                  <span style={styles.detailValue}>
                    {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    }) : bookingDetails?.checkIn}
                  </span>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Calendar size={16} style={styles.detailIcon} />
                <div>
                  <span style={styles.detailLabel}>Check-out</span>
                  <span style={styles.detailValue}>
                    {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    }) : bookingDetails?.checkOut}
                  </span>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Bed size={16} style={styles.detailIcon} />
                <div>
                  <span style={styles.detailLabel}>Rooms</span>
                  <span style={styles.detailValue}>
                    {booking.numberOfRooms || bookingDetails?.rooms} Room(s)
                  </span>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Clock size={16} style={styles.detailIcon} />
                <div>
                  <span style={styles.detailLabel}>Duration</span>
                  <span style={styles.detailValue}>
                    {bookingDetails?.nights || Math.ceil(
                      (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
                    )} Night(s)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <User size={20} style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Guest Information</h3>
            </div>
            <div style={styles.guestDetails}>
              <div style={styles.guestItem}>
                <User size={16} style={styles.guestIcon} />
                <div>
                  <span style={styles.guestLabel}>Name</span>
                  <span style={styles.guestValue}>{booking.guestName}</span>
                </div>
              </div>
              <div style={styles.guestItem}>
                <Mail size={16} style={styles.guestIcon} />
                <div>
                  <span style={styles.guestLabel}>Email</span>
                  <span style={styles.guestValue}>{booking.guestEmail}</span>
                </div>
              </div>
              <div style={styles.guestItem}>
                <Phone size={16} style={styles.guestIcon} />
                <div>
                  <span style={styles.guestLabel}>Phone</span>
                  <span style={styles.guestValue}>{booking.guestPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          {payment && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <CreditCard size={20} style={styles.cardIcon} />
                <h3 style={styles.cardTitle}>Payment Details</h3>
              </div>
              <div style={styles.paymentDetails}>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Transaction ID</span>
                  <span style={styles.paymentValue}>{payment.transaction_id || payment.transactionId}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Status</span>
                  <span style={styles.paymentStatusBadge}>
                    <CheckCircle size={12} />
                    {payment.status || 'Completed'}
                  </span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Method</span>
                  <span style={styles.paymentValue}>
                    {payment.payment_method === 'credit_card' ? 'Credit Card' :
                     payment.payment_method === 'paypal' ? 'PayPal' :
                     payment.payment_method === 'pay_later' ? 'Pay at Hotel' :
                     payment.payment_method}
                  </span>
                </div>
                <div style={styles.divider}></div>
                <div style={styles.paymentTotal}>
                  <span>Total Paid</span>
                  <span style={styles.totalAmount}>${(payment.amount || booking.totalPrice)?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loyalty Rewards Card */}
          <div style={styles.loyaltyCard}>
            <div style={styles.loyaltyHeader}>
              <Award size={24} style={styles.loyaltyIcon} />
              <h3 style={styles.loyaltyTitle}>Loyalty Rewards</h3>
            </div>

            <div style={styles.pointsEarnedBox}>
              <div style={styles.pointsIconBox}>
                <Sparkles size={28} />
              </div>
              <div style={styles.pointsContent}>
                <span style={styles.pointsLabel}>Points Earned</span>
                <span style={styles.pointsAmount}>+{pointsEarned.toLocaleString()} pts</span>
                <span style={styles.pointsSubtext}>
                  ${finalAmount.toFixed(2)} spent = {pointsEarned.toLocaleString()} points
                </span>
              </div>
            </div>

            {actualPointsRedeemed > 0 && (
              <div style={styles.pointsRedeemedBox}>
                <div style={styles.redeemedRow}>
                  <span>Points Redeemed</span>
                  <span style={styles.redeemedValue}>-{actualPointsRedeemed.toLocaleString()} pts</span>
                </div>
                <div style={styles.redeemedRow}>
                  <span>Discount Applied</span>
                  <span style={styles.discountValue}>-${(actualPointsRedeemed / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div style={styles.loyaltyFooter}>
              <Sparkles size={14} />
              Points will be credited to your account shortly
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Important Information</h4>
          <ul style={styles.infoList}>
            <li>Check-in time: 3:00 PM | Check-out time: 11:00 AM</li>
            <li>A valid photo ID is required at check-in</li>
            <li>Free cancellation up to 24 hours before check-in</li>
            <li>A confirmation email has been sent to {booking.guestEmail}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button onClick={() => navigate('/')} style={styles.homeButton}>
            <Home size={20} />
            Back to Home
          </button>
          <button onClick={() => navigate('/bookings')} style={styles.bookingsButton}>
            <FileText size={20} />
            View My Bookings
          </button>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

const getStyles = (darkMode) => ({
  container: {
    minHeight: '100vh',
    background: darkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    padding: '2rem',
  },

  // Header
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    paddingTop: '1rem',
  },
  successIconContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '1.5rem',
  },
  successIconPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    animation: 'pulse 2s ease-in-out infinite',
    zIndex: 1,
  },
  successIcon: {
    position: 'relative',
    width: '100px',
    height: '100px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    animation: 'bounce 1s ease-in-out',
    zIndex: 2,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Content
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  },

  // Reference Card
  referenceCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
  },
  referenceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  referenceLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: '#f1f5f9',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  referenceId: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: 'monospace',
    letterSpacing: '1px',
    marginBottom: '0.75rem',
  },
  referenceStatus: {
    display: 'flex',
    justifyContent: 'center',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    color: '#166534',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Cards Grid
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },

  // Card
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f1f5f9',
  },
  cardIcon: {
    color: '#10b981',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },

  // Hotel Info
  hotelInfo: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  hotelImage: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  hotelDetails: {},
  hotelName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.375rem',
    margin: 0,
  },
  hotelLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  hotelRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#92400e',
  },

  divider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '1rem 0',
  },

  // Details Grid
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.625rem',
  },
  detailIcon: {
    color: '#10b981',
    marginTop: '2px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '0.125rem',
  },
  detailValue: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
  },

  // Guest Details
  guestDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  guestItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  guestIcon: {
    color: '#10b981',
    marginTop: '2px',
  },
  guestLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '0.125rem',
  },
  guestValue: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
  },

  // Payment Details
  paymentDetails: {},
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 0',
    borderBottom: '1px solid #f8fafc',
  },
  paymentLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  paymentValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: '#dcfce7',
    color: '#166534',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  paymentTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  totalAmount: {
    fontSize: '1.25rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  // Loyalty Card
  loyaltyCard: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
    border: '2px solid #10b981',
  },
  loyaltyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  loyaltyIcon: {
    color: '#10b981',
  },
  loyaltyTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#166534',
    margin: 0,
  },
  pointsEarnedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'white',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  pointsIconBox: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  pointsContent: {},
  pointsLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '0.125rem',
  },
  pointsAmount: {
    display: 'block',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '0.125rem',
  },
  pointsSubtext: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  pointsRedeemedBox: {
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  redeemedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '0.5rem',
  },
  redeemedValue: {
    fontWeight: '600',
    color: '#ef4444',
  },
  discountValue: {
    fontWeight: '600',
    color: '#10b981',
  },
  loyaltyFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#047857',
  },

  // Info Box
  infoBox: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
    margin: '0 0 1rem 0',
  },
  infoList: {
    margin: 0,
    padding: '0 0 0 1.25rem',
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.8,
  },

  // Actions
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  homeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    color: '#10b981',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
  },
  bookingsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s',
  },

  // Error State
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: darkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },
  errorCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    textAlign: 'center',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    background: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ef4444',
    margin: '0 auto 1.5rem',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.75rem',
  },
  errorText: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  errorActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  bookingsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    padding: '0.875rem 1.5rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
});

export default Confirmation;
