import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, Download, Calendar, Mail, MapPin, Star,
  Phone, User, CreditCard, Home, Share2, Printer
} from 'lucide-react';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, hotel, bookingDetails, totalPrice } = location.state || {};

  useEffect(() => {
    if (!booking || !hotel) {
      navigate('/hotels');
    }

    // Confetti animation on load
    triggerConfetti();
  }, []);

  const triggerConfetti = () => {
    // Simple confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      // Create confetti particle
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${['#10b981', '#fbbf24', '#ef4444', '#3b82f6'][Math.floor(Math.random() * 4)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        border-radius: 50%;
        animation: confetti-fall 3s linear;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 3000);
    }, 50);
  };

  const confirmationNumber = 'HOP' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleDownloadVoucher = () => {
    alert('Downloading booking voucher... (PDF generation would go here)');
  };

  const handleAddToCalendar = () => {
    alert('Adding to calendar... (.ics file would be generated)');
  };

  const handleShare = () => {
    alert('Share booking details... (Social share dialog)');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* Success Animation */}
      <div style={styles.successSection}>
        <div style={styles.successAnimation}>
          <div style={styles.successCircle}>
            <CheckCircle size={80} color="white" />
          </div>
        </div>
        <h1 style={styles.successTitle}>Booking Confirmed! 🎉</h1>
        <p style={styles.successSubtitle}>
          Your reservation has been successfully completed
        </p>
        <div style={styles.confirmationNumber}>
          Confirmation # <span style={styles.confirmationValue}>{confirmationNumber}</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Left Column - Booking Details */}
          <div style={styles.leftColumn}>
            {/* Hotel Information */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Your Hotel</h2>

              <div style={styles.hotelCard}>
                <img
                  src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                  alt={hotel?.name}
                  style={styles.hotelImage}
                />
                <div style={styles.hotelInfo}>
                  <h3 style={styles.hotelName}>{hotel?.name}</h3>
                  <div style={styles.hotelDetail}>
                    <MapPin size={16} color="#6b7280" />
                    <span>{hotel?.address || hotel?.city || hotel?.location}</span>
                  </div>
                  {hotel?.rating > 0 && (
                    <div style={styles.hotelRating}>
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>{hotel.rating.toFixed(1)} ({hotel.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Reservation Details</h2>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <Calendar size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Check-in</div>
                    <div style={styles.detailValue}>
                      {new Date(bookingDetails?.checkIn).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div style={styles.detailSubtext}>After 3:00 PM</div>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <Calendar size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Check-out</div>
                    <div style={styles.detailValue}>
                      {new Date(bookingDetails?.checkOut).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div style={styles.detailSubtext}>Before 11:00 AM</div>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <Home size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Accommodation</div>
                    <div style={styles.detailValue}>
                      {bookingDetails?.rooms} Room{bookingDetails?.rooms !== 1 ? 's' : ''}
                    </div>
                    <div style={styles.detailSubtext}>
                      {bookingDetails?.nights} night{bookingDetails?.nights !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <User size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Guest Name</div>
                    <div style={styles.detailValue}>{booking?.guestName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>What's Next?</h2>

              <div style={styles.timelineContainer}>
                <div style={styles.timelineItem}>
                  <div style={styles.timelineDot}>1</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineTitle}>Confirmation Email</div>
                    <div style={styles.timelineText}>
                      We've sent a confirmation email to <strong>{booking?.guestEmail}</strong> with all the details.
                    </div>
                  </div>
                </div>

                <div style={styles.timelineItem}>
                  <div style={styles.timelineDot}>2</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineTitle}>Before You Go</div>
                    <div style={styles.timelineText}>
                      Download your voucher and save the confirmation number. You'll need it at check-in.
                    </div>
                  </div>
                </div>

                <div style={styles.timelineItem}>
                  <div style={styles.timelineDot}>3</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineTitle}>At The Hotel</div>
                    <div style={styles.timelineText}>
                      Present your confirmation number and a valid photo ID to receive your room keys.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Summary */}
          <div style={styles.rightColumn}>
            {/* Quick Actions */}
            <div style={styles.actionsCard}>
              <h3 style={styles.actionsTitle}>Quick Actions</h3>

              <div style={styles.actionButtons}>
                <button onClick={handleDownloadVoucher} style={styles.actionButton} className="action-btn">
                  <Download size={20} />
                  <span>Download Voucher</span>
                </button>

                <button onClick={handleAddToCalendar} style={styles.actionButton} className="action-btn">
                  <Calendar size={20} />
                  <span>Add to Calendar</span>
                </button>

                <button onClick={handleShare} style={styles.actionButton} className="action-btn">
                  <Share2 size={20} />
                  <span>Share Booking</span>
                </button>

                <button onClick={handlePrint} style={styles.actionButton} className="action-btn">
                  <Printer size={20} />
                  <span>Print Details</span>
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Payment Summary</h3>

              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>${hotel?.pricePerNight} × {bookingDetails?.nights} nights</span>
                  <span>${totalPrice?.subtotal?.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Taxes & Fees</span>
                  <span>${totalPrice?.taxes?.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Service Fee</span>
                  <span>${totalPrice?.fees?.toFixed(2)}</span>
                </div>

                <div style={styles.totalRow}>
                  <span>Total Paid</span>
                  <span>${totalPrice?.total?.toFixed(2)}</span>
                </div>
              </div>

              <div style={styles.paymentMethod}>
                <CreditCard size={18} color="#10b981" />
                <span>Payment successful</span>
              </div>
            </div>

            {/* Contact Information */}
            <div style={styles.contactCard}>
              <h3 style={styles.contactTitle}>Need Help?</h3>
              <div style={styles.contactInfo}>
                <div style={styles.contactItem}>
                  <Mail size={18} color="#10b981" />
                  <span>support@houseofparadise.com</span>
                </div>
                <div style={styles.contactItem}>
                  <Phone size={18} color="#10b981" />
                  <span>+1 (800) 123-4567</span>
                </div>
              </div>
              <div style={styles.contactNote}>
                24/7 Customer Support Available
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={styles.ctaButtons}>
              <button
                onClick={() => navigate('/bookings')}
                style={styles.viewBookingsButton}
                className="view-bookings-btn"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                style={styles.homeButton}
                className="home-btn"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  successSection: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '4rem 2rem',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  successAnimation: {
    marginBottom: '2rem',
  },
  successCircle: {
    width: '160px',
    height: '160px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    animation: 'pulse 2s infinite',
    backdropFilter: 'blur(10px)',
  },
  successTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    marginBottom: '1rem',
  },
  successSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.95,
    marginBottom: '2rem',
  },
  confirmationNumber: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  confirmationValue: {
    fontWeight: '800',
    fontSize: '1.3rem',
    letterSpacing: '2px',
    marginLeft: '0.5rem',
  },
  main: {
    padding: '3rem 2rem',
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  hotelCard: {
    display: 'flex',
    gap: '1.5rem',
  },
  hotelImage: {
    width: '200px',
    height: '200px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '1rem',
    lineHeight: '1.3',
  },
  hotelDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
  },
  hotelRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#92400e',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
  },
  detailItem: {
    display: 'flex',
    gap: '1rem',
  },
  detailIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  detailSubtext: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
  },
  timelineDot: {
    width: '40px',
    height: '40px',
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
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  timelineText: {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: '1.6',
  },
  actionsCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  actionsTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1f2937',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  priceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1f2937',
    paddingTop: '1rem',
    marginTop: '1rem',
    borderTop: '2px solid #10b981',
  },
  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#f0fdf4',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#047857',
  },
  contactCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  contactTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: '#374151',
    fontWeight: '500',
  },
  contactNote: {
    fontSize: '0.8rem',
    color: '#10b981',
    fontWeight: '700',
    textAlign: 'center',
    padding: '0.75rem',
    background: '#f0fdf4',
    borderRadius: '8px',
  },
  ctaButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  viewBookingsButton: {
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  homeButton: {
    padding: '0.875rem',
    background: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
      }
    }

    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    .action-btn:hover {
      background: #f0fdf4;
      border-color: #10b981;
      color: #047857;
      transform: translateX(4px);
    }

    .view-bookings-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .home-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-2px);
    }

    @media print {
      .actionsCard, .ctaButtons, .contactCard {
        display: none !important;
      }
    }

    @media (max-width: 1024px) {
      .contentWrapper {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default BookingConfirmation;
