import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, paymentService } from '../services/api';
import {
  Calendar, CreditCard, Hotel, Plane, Loader, Download,
  CheckCircle, Clock, XCircle, AlertCircle, Filter, Search,
  MapPin, Users, Bed, ArrowRight, TrendingUp, DollarSign, Sparkles,
  FileText
} from 'lucide-react';

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, hotels, trips
  const [activePaymentFilter, setActivePaymentFilter] = useState('all'); // all, completed, pending, failed
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.darkMode || false;
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;

  // Get responsive styles based on screen size
  const responsiveStyles = getResponsiveStyles(isMobile);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ensure userId exists before making API calls
      if (!userId) {
        console.warn('User ID not found, cannot fetch bookings');
        setBookings([]);
        setPayments([]);
        setLoading(false);
        return;
      }

      // Fetch bookings and payments separately to handle errors independently
      let bookingsData = [];
      let paymentsData = [];

      try {
        const bookingsRes = await bookingService.getUserBookings(userId);
        console.log('Bookings response:', bookingsRes.data);
        bookingsData = bookingsRes.data?.data || bookingsRes.data || [];
        // Ensure it's an array
        if (!Array.isArray(bookingsData)) {
          console.warn('Bookings data is not an array:', bookingsData);
          bookingsData = [];
        }
      } catch (bookingError) {
        console.error('Error fetching bookings:', bookingError);
      }

      try {
        const paymentsRes = await paymentService.getUserPayments(userId);
        console.log('Payments response:', paymentsRes.data);
        paymentsData = paymentsRes.data?.data || paymentsRes.data || [];
        // Ensure it's an array
        if (!Array.isArray(paymentsData)) {
          console.warn('Payments data is not an array:', paymentsData);
          paymentsData = [];
        }
      } catch (paymentError) {
        console.error('Error fetching payments:', paymentError);
      }

      setBookings(bookingsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setBookings([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return { bg: '#10b981', icon: CheckCircle };
      case 'pending':
        return { bg: '#f59e0b', icon: Clock };
      case 'cancelled':
      case 'failed':
        return { bg: '#ef4444', icon: XCircle };
      default:
        return { bg: '#6b7280', icon: AlertCircle };
    }
  };

  const filterBookings = () => {
    if (activeTab === 'all') return bookings;
    if (activeTab === 'hotels') return bookings.filter((b) => b.hotelId);
    if (activeTab === 'trips') return bookings.filter((b) => !b.hotelId);
    return bookings;
  };

  const filterPayments = () => {
    if (activePaymentFilter === 'all') return payments;
    return payments.filter((p) => p.status?.toLowerCase() === activePaymentFilter);
  };

  const filteredBookings = filterBookings();
  const filteredPayments = filterPayments();

  const calculateStats = () => {
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const completedBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length;
    const upcomingBookings = bookings.filter((b) => b.status === 'confirmed').length;

    return { totalSpent, completedBookings, upcomingBookings };
  };

  const stats = calculateStats();

  // Generate and download PDF receipt for a payment
  const downloadPaymentReceipt = (payment) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Create PDF content as HTML
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - House of Paradise</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #1f2937; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #10b981; }
          .logo { font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 5px; }
          .logo-sub { font-size: 12px; color: #6b7280; letter-spacing: 2px; }
          .receipt-title { font-size: 24px; font-weight: 700; margin-top: 20px; color: #1f2937; }
          .receipt-number { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
          .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
          .row:last-child { border-bottom: none; }
          .label { color: #6b7280; font-size: 14px; }
          .value { font-weight: 600; color: #1f2937; font-size: 14px; text-align: right; }
          .total-section { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; margin-top: 30px; }
          .total-row { display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 18px; font-weight: 600; }
          .total-value { font-size: 32px; font-weight: 800; }
          .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .status-completed { background: #d1fae5; color: #059669; }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-failed { background: #fee2e2; color: #dc2626; }
          .footer { margin-top: 50px; text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; }
          .footer-text { font-size: 12px; color: #9ca3af; line-height: 1.8; }
          .footer-brand { font-weight: 700; color: #10b981; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">✈ House of Paradise</div>
          <div class="logo-sub">YOUR JOURNEY BEGINS HERE</div>
          <div class="receipt-title">Payment Receipt</div>
          <div class="receipt-number">Transaction #${payment.transaction_id || 'N/A'}</div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="row">
            <span class="label">Name</span>
            <span class="value">${user.name || 'Guest'}</span>
          </div>
          <div class="row">
            <span class="label">Email</span>
            <span class="value">${user.email || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="row">
            <span class="label">Transaction ID</span>
            <span class="value">${payment.transaction_id || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Booking Type</span>
            <span class="value">${payment.booking_type ? payment.booking_type.charAt(0).toUpperCase() + payment.booking_type.slice(1) : 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Booking ID</span>
            <span class="value">${payment.booking_id || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method</span>
            <span class="value">${payment.payment_method ? payment.payment_method.replace('_', ' ').toUpperCase() : 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Date</span>
            <span class="value">${new Date(payment.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="row">
            <span class="label">Time</span>
            <span class="value">${new Date(payment.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="row">
            <span class="label">Status</span>
            <span class="value"><span class="status-badge status-${payment.status?.toLowerCase()}">${payment.status?.toUpperCase() || 'N/A'}</span></span>
          </div>
        </div>

        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Total Amount Paid</span>
            <span class="total-value">$${payment.amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div class="footer">
          <p class="footer-text">
            Thank you for choosing <span class="footer-brand">House of Paradise</span>!<br>
            This receipt was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.<br>
            For any questions, please contact support@houseofparadise.com
          </p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print/save as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (loading) {
    return (
      <div style={{
        ...styles.loading,
        background: darkMode ? '#000000' : '#f9fafb',
      }}>
        <div style={styles.loaderWrapper}>
          <Loader size={64} color="#10b981" className="spinner" />
          <p style={{
            ...styles.loadingText,
            color: darkMode ? '#9ca3af' : '#6b7280',
          }}>
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{bookingAnimations}</style>

      <div style={{
        ...responsiveStyles.container,
        background: darkMode
          ? 'radial-gradient(ellipse at top, #0a0a1a 0%, #050510 50%, #000000 100%)'
          : 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}>
        {/* Hero Header */}
        <div style={{
          ...responsiveStyles.hero,
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }}>
          <div style={responsiveStyles.heroContent}>
            <div className="scroll-reveal" style={responsiveStyles.heroIcon}>
              <Sparkles size={32} color="#ffffff" />
            </div>
            <h1 className="paradise-title" style={responsiveStyles.title}>
              My Bookings
            </h1>
            <p style={responsiveStyles.subtitle}>
              Track and manage all your reservations in one place
            </p>

            {/* Stats Cards */}
            <div style={responsiveStyles.statsRow}>
              <div className="scroll-reveal" style={{
                ...responsiveStyles.statCard,
                background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.15)',
              }}>
                <DollarSign size={isMobile ? 14 : 16} color="#ffffff" />
                <div style={responsiveStyles.statContent}>
                  <span style={responsiveStyles.statValue}>${stats.totalSpent.toFixed(2)}</span>
                  <span style={responsiveStyles.statLabel}>spent</span>
                </div>
              </div>

              <div className="scroll-reveal" style={{
                ...responsiveStyles.statCard,
                background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.15)',
              }}>
                <TrendingUp size={isMobile ? 14 : 16} color="#ffffff" />
                <div style={responsiveStyles.statContent}>
                  <span style={responsiveStyles.statValue}>{stats.completedBookings}</span>
                  <span style={responsiveStyles.statLabel}>completed</span>
                </div>
              </div>

              <div className="scroll-reveal" style={{
                ...responsiveStyles.statCard,
                background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.15)',
              }}>
                <Calendar size={isMobile ? 14 : 16} color="#ffffff" />
                <div style={responsiveStyles.statContent}>
                  <span style={responsiveStyles.statValue}>{stats.upcomingBookings}</span>
                  <span style={responsiveStyles.statLabel}>upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={responsiveStyles.content}>
          {/* Bookings Section */}
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <h2 style={{
                ...responsiveStyles.sectionTitle,
                color: darkMode ? '#ffffff' : '#1f2937',
              }}>
                <Hotel size={isMobile ? 22 : 28} color="#10b981" />
                Your Reservations
              </h2>

              {/* Tab Filters */}
              <div style={responsiveStyles.tabs}>
                {['all', 'hotels', 'trips'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      ...responsiveStyles.tab,
                      background: activeTab === tab
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : darkMode ? '#2a2a3e' : '#f3f4f6',
                      color: activeTab === tab ? '#ffffff' : darkMode ? '#9ca3af' : '#6b7280',
                      boxShadow: activeTab === tab ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                    className="clickable hover-lift"
                  >
                    {tab === 'all' && 'All Bookings'}
                    {tab === 'hotels' && 'Hotels'}
                    {tab === 'trips' && 'Trips'}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div style={{
                ...styles.empty,
                background: darkMode
                  ? 'linear-gradient(135deg, #1e293b 0%, #1a1a2e 100%)'
                  : '#ffffff',
                border: darkMode ? '2px solid #334155' : '2px solid #e5e7eb',
                padding: isMobile ? '2rem 1rem' : '4rem 2rem',
                marginTop: '1rem',
              }}>
                <div style={styles.emptyIcon}>
                  <Hotel size={isMobile ? 48 : 64} color={darkMode ? '#10b981' : '#d1d5db'} />
                </div>
                <h3 style={{
                  ...styles.emptyTitle,
                  color: darkMode ? '#f1f5f9' : '#1f2937',
                  fontSize: isMobile ? '1.25rem' : '2rem',
                }}>
                  No bookings found
                </h3>
                <p style={{
                  ...styles.emptyText,
                  color: darkMode ? '#cbd5e1' : '#6b7280',
                  fontSize: isMobile ? '0.9rem' : '1.1rem',
                }}>
                  Start exploring amazing hotels and trips!
                </p>
                <button
                  onClick={() => navigate('/hotels')}
                  style={{
                    ...styles.emptyButton,
                    padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                  className="clickable hover-lift"
                >
                  <ArrowRight size={isMobile ? 18 : 20} />
                  <span>Explore Now</span>
                </button>
              </div>
            ) : (
              <div style={responsiveStyles.grid}>
                {filteredBookings.map((booking, index) => {
                  const statusInfo = getStatusColor(booking.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={booking._id || booking.id}
                      className="spotlight-card hover-lift"
                      style={{
                        ...styles.card,
                        background: darkMode
                          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                        border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                      }}
                    >
                      <div style={{
                        ...styles.cardHeader,
                        background: darkMode ? '#0f0f1a' : '#f9fafb',
                      }}>
                        <div style={styles.cardIconWrapper}>
                          {booking.hotelId ? (
                            <Hotel size={24} color="#10b981" />
                          ) : (
                            <Plane size={24} color="#0ea5e9" />
                          )}
                        </div>
                        <div
                          style={{
                            ...styles.statusBadge,
                            background: statusInfo.bg,
                          }}
                        >
                          <StatusIcon size={16} />
                          <span>{booking.status}</span>
                        </div>
                      </div>

                      <div style={styles.cardBody}>
                        <div style={styles.bookingInfo}>
                          <span style={{
                            ...styles.bookingLabel,
                            color: darkMode ? '#9ca3af' : '#6b7280',
                          }}>
                            Booking ID
                          </span>
                          <span style={{
                            ...styles.bookingValue,
                            color: darkMode ? '#e5e7eb' : '#1f2937',
                          }}>
                            #{(booking._id || booking.id).slice(-8).toUpperCase()}
                          </span>
                        </div>

                        {booking.checkIn && (
                          <>
                            <div style={styles.dateRow}>
                              <div style={styles.dateBox}>
                                <Calendar size={18} color="#10b981" />
                                <div>
                                  <span style={{
                                    ...styles.dateLabel,
                                    color: darkMode ? '#9ca3af' : '#6b7280',
                                  }}>
                                    Check-in
                                  </span>
                                  <span style={{
                                    ...styles.dateValue,
                                    color: darkMode ? '#e5e7eb' : '#1f2937',
                                  }}>
                                    {new Date(booking.checkIn).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div style={styles.dateBox}>
                                <Calendar size={18} color="#f59e0b" />
                                <div>
                                  <span style={{
                                    ...styles.dateLabel,
                                    color: darkMode ? '#9ca3af' : '#6b7280',
                                  }}>
                                    Check-out
                                  </span>
                                  <span style={{
                                    ...styles.dateValue,
                                    color: darkMode ? '#e5e7eb' : '#1f2937',
                                  }}>
                                    {new Date(booking.checkOut).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={styles.detailsRow}>
                              {booking.numberOfRooms && (
                                <div style={styles.detailChip}>
                                  <Bed size={16} color="#10b981" />
                                  <span style={{ color: darkMode ? '#e5e7eb' : '#1f2937' }}>
                                    {booking.numberOfRooms} {booking.numberOfRooms === 1 ? 'Room' : 'Rooms'}
                                  </span>
                                </div>
                              )}
                              {booking.numberOfGuests && (
                                <div style={styles.detailChip}>
                                  <Users size={16} color="#8b5cf6" />
                                  <span style={{ color: darkMode ? '#e5e7eb' : '#1f2937' }}>
                                    {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {booking.numberOfSeats && (
                          <div style={styles.detailChip}>
                            <Users size={16} color="#0ea5e9" />
                            <span style={{ color: darkMode ? '#e5e7eb' : '#1f2937' }}>
                              {booking.numberOfSeats} {booking.numberOfSeats === 1 ? 'Seat' : 'Seats'}
                            </span>
                          </div>
                        )}

                        <div style={{
                          ...styles.divider,
                          background: darkMode ? '#2a2a3e' : '#e5e7eb',
                        }}></div>

                        <div style={styles.totalRow}>
                          <span style={{
                            ...styles.totalLabel,
                            color: darkMode ? '#9ca3af' : '#6b7280',
                          }}>
                            Total Price
                          </span>
                          <span style={styles.totalValue}>${booking.totalPrice}</span>
                        </div>

                        <div style={{
                          ...styles.bookedDate,
                          color: darkMode ? '#9ca3af' : '#6b7280',
                        }}>
                          Booked on{' '}
                          {new Date(booking.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Payment History Section */}
          <section style={responsiveStyles.section}>
            <div style={responsiveStyles.sectionHeader}>
              <h2 style={{
                ...responsiveStyles.sectionTitle,
                color: darkMode ? '#ffffff' : '#1f2937',
              }}>
                <CreditCard size={isMobile ? 22 : 28} color="#10b981" />
                Payment History
              </h2>

              {/* Payment Filters */}
              <div style={responsiveStyles.tabs}>
                {['all', 'completed', 'pending', 'failed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActivePaymentFilter(filter)}
                    style={{
                      ...responsiveStyles.tab,
                      background: activePaymentFilter === filter
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : darkMode ? '#2a2a3e' : '#f3f4f6',
                      color: activePaymentFilter === filter ? '#ffffff' : darkMode ? '#9ca3af' : '#6b7280',
                      boxShadow: activePaymentFilter === filter ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                    className="clickable hover-lift"
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div style={{
                ...styles.empty,
                background: darkMode
                  ? 'linear-gradient(135deg, #1e293b 0%, #1a1a2e 100%)'
                  : '#ffffff',
                border: darkMode ? '2px solid #334155' : '2px solid #e5e7eb',
                padding: isMobile ? '2rem 1rem' : '4rem 2rem',
                marginTop: '1rem',
              }}>
                <CreditCard size={isMobile ? 48 : 64} color={darkMode ? '#10b981' : '#d1d5db'} />
                <h3 style={{
                  ...styles.emptyTitle,
                  color: darkMode ? '#f1f5f9' : '#1f2937',
                  fontSize: isMobile ? '1.25rem' : '2rem',
                }}>
                  No payment history
                </h3>
              </div>
            ) : isMobile ? (
              // Mobile: Display as cards
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredPayments.map((payment) => {
                  const statusInfo = getStatusColor(payment.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={payment.id}
                      style={{
                        background: darkMode ? '#1a1a2e' : '#ffffff',
                        border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.75rem' }}>
                          #{payment.transaction_id?.slice(-8).toUpperCase() || 'N/A'}
                        </span>
                        <div style={{ ...styles.statusBadge, background: statusInfo.bg, padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                          <StatusIcon size={12} />
                          <span>{payment.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: darkMode ? '#e5e7eb' : '#1f2937', fontWeight: '700', fontSize: '1.25rem' }}>
                            ${payment.amount}
                          </div>
                          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.8rem' }}>
                            {payment.booking_type || 'N/A'} • {payment.payment_method || 'N/A'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.75rem', textAlign: 'right' }}>
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <button
                            onClick={() => downloadPaymentReceipt(payment)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              cursor: 'pointer',
                            }}
                            title="Download Receipt"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Desktop: Display as table
              <div style={{
                ...styles.paymentTable,
                background: darkMode ? '#1a1a2e' : '#ffffff',
                border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
              }} className="spotlight-card">
                {/* Table Header */}
                <div style={{
                  ...styles.tableHeader,
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  color: darkMode ? '#e5e7eb' : '#374151',
                }}>
                  <div style={styles.tableCell}>Transaction ID</div>
                  <div style={styles.tableCell}>Type</div>
                  <div style={styles.tableCell}>Amount</div>
                  <div style={styles.tableCell}>Method</div>
                  <div style={styles.tableCell}>Status</div>
                  <div style={styles.tableCell}>Date</div>
                  <div style={{ ...styles.tableCell, justifyContent: 'center' }}>Receipt</div>
                </div>

                {/* Table Rows */}
                {filteredPayments.map((payment, index) => {
                  const statusInfo = getStatusColor(payment.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={payment.id}
                      style={{
                        ...styles.tableRow,
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        background: index % 2 === 0
                          ? darkMode ? '#1a1a2e' : '#ffffff'
                          : darkMode ? '#16213e' : '#f9fafb',
                        borderBottom: darkMode ? '1px solid #2a2a3e' : '1px solid #f3f4f6',
                      }}
                      className="hover-row"
                    >
                      <div style={{
                        ...styles.tableCell,
                        color: darkMode ? '#e5e7eb' : '#1f2937',
                      }}>
                        #{payment.transaction_id?.slice(-8).toUpperCase() || 'N/A'}
                      </div>
                      <div style={{
                        ...styles.tableCell,
                        color: darkMode ? '#9ca3af' : '#6b7280',
                      }}>
                        {payment.booking_type || 'N/A'}
                      </div>
                      <div style={{
                        ...styles.tableCell,
                        color: darkMode ? '#e5e7eb' : '#1f2937',
                        fontWeight: '700',
                      }}>
                        ${payment.amount}
                      </div>
                      <div style={{
                        ...styles.tableCell,
                        color: darkMode ? '#9ca3af' : '#6b7280',
                      }}>
                        {payment.payment_method || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <div
                          style={{
                            ...styles.statusBadge,
                            background: statusInfo.bg,
                            padding: '0.5rem 1rem',
                          }}
                        >
                          <StatusIcon size={14} />
                          <span>{payment.status}</span>
                        </div>
                      </div>
                      <div style={{
                        ...styles.tableCell,
                        color: darkMode ? '#9ca3af' : '#6b7280',
                      }}>
                        {new Date(payment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div style={{ ...styles.tableCell, justifyContent: 'center' }}>
                        <button
                          onClick={() => downloadPaymentReceipt(payment)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          className="download-btn"
                          title="Download Receipt"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

const bookingAnimations = `
  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .hover-lift:hover {
    transform: translateY(-4px) scale(1.02);
  }

  .download-btn:hover {
    background: rgba(16, 185, 129, 0.25) !important;
    transform: scale(1.1);
  }

  .hover-row:hover {
    background: rgba(16, 185, 129, 0.05) !important;
  }
`;

// Helper function to get responsive styles
const getResponsiveStyles = (isMobile) => ({
  container: {
    minHeight: '100vh',
    transition: 'background 1.2s ease',
  },
  hero: {
    padding: isMobile ? '1.5rem 1rem 1rem' : '2rem 2rem 1.5rem 2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroIcon: {
    display: 'none',
  },
  title: {
    fontSize: isMobile ? '1.5rem' : '2.25rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: isMobile ? '0.875rem' : '1rem',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: isMobile ? '1rem' : '1.25rem',
    fontWeight: '500',
  },
  statsRow: {
    display: 'flex',
    gap: isMobile ? '0.5rem' : '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statCard: {
    padding: isMobile ? '0.5rem 0.75rem' : '0.625rem 1rem',
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    minWidth: isMobile ? 'auto' : 'auto',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  statValue: {
    fontSize: isMobile ? '0.875rem' : '1rem',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: isMobile ? '0.75rem' : '0.85rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isMobile ? '1rem' : '2rem',
  },
  section: {
    marginBottom: isMobile ? '2rem' : '4rem',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? '1rem' : '2rem',
    gap: '1rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: isMobile ? '1.25rem' : '2rem',
    fontWeight: '800',
  },
  tabs: {
    display: 'flex',
    gap: isMobile ? '0.5rem' : '0.75rem',
    flexWrap: 'wrap',
    width: isMobile ? '100%' : 'auto',
  },
  tab: {
    padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    fontSize: isMobile ? '0.8rem' : '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: isMobile ? '1' : 'none',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: isMobile ? '1rem' : '2rem',
  },
});

const styles = {
  card: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '50px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: '1.5rem',
  },
  bookingInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  bookingLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  bookingValue: {
    fontSize: '0.95rem',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  dateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  dateLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dateValue: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '700',
    marginTop: '0.25rem',
  },
  detailsRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  detailChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  divider: {
    height: '1px',
    margin: '1.5rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  bookedDate: {
    fontSize: '0.85rem',
  },
  paymentTable: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    padding: '1.25rem',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid rgba(16, 185, 129, 0.2)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    padding: '1.25rem',
    transition: 'all 0.2s ease',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  empty: {
    borderRadius: '20px',
    padding: '4rem 2rem',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  emptyIcon: {
    marginBottom: '1.5rem',
  },
  emptyTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    marginBottom: '2rem',
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  loaderWrapper: {
    textAlign: 'center',
  },
  loadingText: {
    marginTop: '1.5rem',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
};

export default Bookings;
