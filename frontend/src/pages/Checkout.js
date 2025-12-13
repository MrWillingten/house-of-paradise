import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { bookingService, paymentService, completeBooking } from '../services/api';
import { countries } from '../utils/countries';
import {
  CreditCard, Calendar, User, Mail, Phone, MapPin, Lock,
  Check, ChevronRight, AlertCircle, Shield, Clock, Star, Sparkles
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hotel, bookingDetails } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Guest Info
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',

    // Step 2: Payment
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',

    // Billing
    billingAddress: '',
    city: '',
    zipCode: '',
    country: '',

    // Step 3: Review
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [applyingPoints, setApplyingPoints] = useState(false);

  useEffect(() => {
    if (!hotel || !bookingDetails) {
      navigate('/hotels');
    }

    // Auto-fill from localStorage if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setFormData(prev => ({
        ...prev,
        guestEmail: user.email,
        guestName: user.name || '',
      }));
    }

    // Fetch loyalty data
    if (user.id) {
      fetchLoyaltyData(user.id);
    }
  }, []);

  const fetchLoyaltyData = async (userId) => {
    try {
      const response = await api.get(`/api/loyalty/profile/${userId}`);
      if (response.data.success) {
        setLoyaltyData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.guestName.trim()) newErrors.guestName = 'Name is required';
      if (!formData.guestEmail.trim()) newErrors.guestEmail = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) newErrors.guestEmail = 'Invalid email';
      if (!formData.guestPhone.trim()) newErrors.guestPhone = 'Phone is required';
    }

    if (step === 2) {
      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
          newErrors.cardNumber = 'Invalid card number';
        }
        if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name required';
        if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
          newErrors.expiryDate = 'Invalid expiry (MM/YY)';
        }
        if (!formData.cvv.match(/^\d{3,4}$/)) {
          newErrors.cvv = 'Invalid CVV';
        }
      }
      if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Address required';
      if (!formData.city.trim()) newErrors.city = 'City required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code required';
      if (!formData.country.trim()) newErrors.country = 'Country required';
    }

    if (step === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setProcessing(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user.id) {
        alert('Please log in to complete your booking');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      // Use the complete-booking endpoint which handles both booking and payment
      // API expects: { type, bookingData, paymentData, loyaltyData }
      const response = await completeBooking({
        type: 'hotel',
        bookingData: {
          hotelId: hotel._id,
          userId: user.id,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          numberOfRooms: bookingDetails.rooms,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          totalPrice: pricing.total,
          specialRequests: formData.specialRequests,
        },
        paymentData: {
          amount: pricing.total,
          payment_method: formData.paymentMethod === 'card' ? 'credit_card' :
                          formData.paymentMethod === 'paypal' ? 'paypal' : 'pay_later',
        },
        loyaltyData: {
          pointsToRedeem: pointsToRedeem,
          pointsDiscount: pricing.pointsDiscount,
        },
      });

      if (response.data.success) {
        // Navigate to confirmation with all the booking details including loyalty info
        navigate('/confirmation', {
          state: {
            booking: response.data.data.booking,
            payment: response.data.data.payment,
            loyalty: response.data.data.loyalty, // Include loyalty data from API response
            type: 'hotel',
            hotel: hotel,
            bookingDetails: bookingDetails,
            totalPrice: pricing,
            pointsRedeemed: pointsToRedeem
          }
        });
      } else {
        throw new Error(response.data.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      alert(error.response?.data?.error || error.message || 'Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!hotel || !bookingDetails) return 0;

    const nights = bookingDetails.nights;
    const rooms = bookingDetails.rooms;
    const subtotal = hotel.pricePerNight * nights * rooms;
    const taxes = subtotal * 0.12;
    const fees = 25;

    // Points discount: 100 points = $1
    const pointsDiscount = pointsToRedeem / 100;

    return {
      subtotal,
      taxes,
      fees,
      pointsDiscount,
      total: Math.max(0, subtotal + taxes + fees - pointsDiscount)
    };
  };

  const applyPoints = (points) => {
    if (!loyaltyData) return;

    const maxPointsAllowed = Math.floor(pricing.total * 100); // Can't discount more than total
    const availablePoints = loyaltyData.availablePoints || 0;
    const maxUsablePoints = Math.min(maxPointsAllowed, availablePoints);

    const pointsValue = Math.min(Math.max(0, points), maxUsablePoints);
    setPointsToRedeem(pointsValue);
  };

  const applyMaxPoints = () => {
    if (!loyaltyData) return;

    const totalBeforeDiscount = pricing.subtotal + pricing.taxes + pricing.fees;
    const maxPointsAllowed = Math.floor(totalBeforeDiscount * 100);
    const availablePoints = loyaltyData.availablePoints || 0;
    const maxUsablePoints = Math.min(maxPointsAllowed, availablePoints);

    setPointsToRedeem(maxUsablePoints);
  };

  const pricing = calculateTotal();

  const steps = [
    { number: 1, title: 'Guest Details', icon: <User size={20} /> },
    { number: 2, title: 'Payment', icon: <CreditCard size={20} /> },
    { number: 3, title: 'Review & Book', icon: <Check size={20} /> },
  ];

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  return (
    <div style={styles.container}>
      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressContent}>
          <div style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div style={styles.stepItem}>
                  <div style={
                    currentStep > step.number
                      ? styles.stepCircleComplete
                      : currentStep === step.number
                      ? styles.stepCircleActive
                      : styles.stepCircle
                  }>
                    {currentStep > step.number ? (
                      <Check size={20} />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div style={styles.stepLabel}>
                    <div style={styles.stepNumber}>Step {step.number}</div>
                    <div style={styles.stepTitle}>{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div style={
                    currentStep > step.number
                      ? styles.stepLineComplete
                      : styles.stepLine
                  } />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.contentWrapper} className="contentWrapper">
          {/* Left Column - Form */}
          <div style={styles.formColumn}>
            {/* Step 1: Guest Details */}
            {currentStep === 1 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepHeading}>Guest Information</h2>
                <p style={styles.stepSubheading}>Who's checking in?</p>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <User size={16} color="#10b981" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                      placeholder="John Doe"
                      style={errors.guestName ? styles.inputError : styles.input}
                    />
                    {errors.guestName && <div style={styles.error}>{errors.guestName}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Mail size={16} color="#10b981" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                      placeholder="john@example.com"
                      style={errors.guestEmail ? styles.inputError : styles.input}
                    />
                    {errors.guestEmail && <div style={styles.error}>{errors.guestEmail}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Phone size={16} color="#10b981" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      style={errors.guestPhone ? styles.inputError : styles.input}
                    />
                    {errors.guestPhone && <div style={styles.error}>{errors.guestPhone}</div>}
                  </div>

                  <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                    <label style={styles.label}>
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                      placeholder="Early check-in, high floor, quiet room, etc."
                      style={styles.textarea}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepHeading}>Payment Information</h2>
                <p style={styles.stepSubheading}>Secure payment processing</p>

                {/* Payment Method Selection */}
                <div style={styles.paymentMethods}>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                    style={formData.paymentMethod === 'card' ? styles.paymentMethodActive : styles.paymentMethod}
                    className="payment-method-btn"
                  >
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, paymentMethod: 'paypal'})}
                    style={formData.paymentMethod === 'paypal' ? styles.paymentMethodActive : styles.paymentMethod}
                    className="payment-method-btn"
                  >
                    <span style={styles.paypalIcon}>PayPal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, paymentMethod: 'later'})}
                    style={formData.paymentMethod === 'later' ? styles.paymentMethodActive : styles.paymentMethod}
                    className="payment-method-btn"
                  >
                    <Clock size={24} />
                    <span>Pay at Hotel</span>
                  </button>
                </div>

                {/* Card Details (if card selected) */}
                {formData.paymentMethod === 'card' && (
                  <div style={styles.cardForm}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <CreditCard size={16} color="#10b981" />
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={formatCardNumber(formData.cardNumber)}
                        onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        style={errors.cardNumber ? styles.inputError : styles.input}
                      />
                      {errors.cardNumber && <div style={styles.error}>{errors.cardNumber}</div>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <User size={16} color="#10b981" />
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                        placeholder="JOHN DOE"
                        style={errors.cardName ? styles.inputError : styles.input}
                      />
                      {errors.cardName && <div style={styles.error}>{errors.cardName}</div>}
                    </div>

                    <div style={styles.cardRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          <Calendar size={16} color="#10b981" />
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                          maxLength={5}
                          style={errors.expiryDate ? styles.inputError : styles.input}
                        />
                        {errors.expiryDate && <div style={styles.error}>{errors.expiryDate}</div>}
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          <Lock size={16} color="#10b981" />
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                          placeholder="123"
                          maxLength={4}
                          style={errors.cvv ? styles.inputError : styles.input}
                        />
                        {errors.cvv && <div style={styles.error}>{errors.cvv}</div>}
                      </div>
                    </div>

                    <div style={styles.securityNote}>
                      <Shield size={16} color="#10b981" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </div>
                )}

                {/* PayPal Notice */}
                {formData.paymentMethod === 'paypal' && (
                  <div style={styles.paypalNotice}>
                    <div style={styles.noticeIcon}>💳</div>
                    <div>
                      <div style={styles.noticeTitle}>PayPal Payment</div>
                      <div style={styles.noticeText}>
                        You'll be redirected to PayPal to complete your payment securely.
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay Later Notice */}
                {formData.paymentMethod === 'later' && (
                  <div style={styles.laterNotice}>
                    <div style={styles.noticeIcon}>🏨</div>
                    <div>
                      <div style={styles.noticeTitle}>Pay at Hotel</div>
                      <div style={styles.noticeText}>
                        No payment required now. Pay when you arrive at the hotel.
                        Cancellation policy still applies.
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                <div style={styles.billingSection}>
                  <h3 style={styles.sectionTitle}>Billing Address</h3>

                  <div style={styles.formGrid}>
                    <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                      <label style={styles.label}>
                        <MapPin size={16} color="#10b981" />
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress}
                        onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                        placeholder="123 Main Street, Apt 4B"
                        style={errors.billingAddress ? styles.inputError : styles.input}
                      />
                      {errors.billingAddress && <div style={styles.error}>{errors.billingAddress}</div>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="New York"
                        style={errors.city ? styles.inputError : styles.input}
                      />
                      {errors.city && <div style={styles.error}>{errors.city}</div>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Zip Code *</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        placeholder="10001"
                        style={errors.zipCode ? styles.inputError : styles.input}
                      />
                      {errors.zipCode && <div style={styles.error}>{errors.zipCode}</div>}
                    </div>

                    <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                      <label style={styles.label}>Country *</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        style={errors.country ? styles.inputError : styles.select}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.iso} value={country.iso}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                      {errors.country && <div style={styles.error}>{errors.country}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {currentStep === 3 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepHeading}>Review Your Booking</h2>
                <p style={styles.stepSubheading}>Please verify all details before confirming</p>

                {/* Booking Summary */}
                <div style={styles.reviewSection}>
                  <h3 style={styles.reviewTitle}>Booking Details</h3>
                  <div style={styles.reviewGrid}>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Hotel</div>
                      <div style={styles.reviewValue}>{hotel?.name}</div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Location</div>
                      <div style={styles.reviewValue}>{hotel?.city || hotel?.location}</div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Check-in</div>
                      <div style={styles.reviewValue}>
                        {new Date(bookingDetails?.checkIn).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Check-out</div>
                      <div style={styles.reviewValue}>
                        {new Date(bookingDetails?.checkOut).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Nights</div>
                      <div style={styles.reviewValue}>{bookingDetails?.nights}</div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Rooms</div>
                      <div style={styles.reviewValue}>{bookingDetails?.rooms}</div>
                    </div>
                  </div>
                </div>

                {/* Guest Info Summary */}
                <div style={styles.reviewSection}>
                  <h3 style={styles.reviewTitle}>Guest Information</h3>
                  <div style={styles.reviewGrid}>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Name</div>
                      <div style={styles.reviewValue}>{formData.guestName}</div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Email</div>
                      <div style={styles.reviewValue}>{formData.guestEmail}</div>
                    </div>
                    <div style={styles.reviewItem}>
                      <div style={styles.reviewLabel}>Phone</div>
                      <div style={styles.reviewValue}>{formData.guestPhone}</div>
                    </div>
                  </div>
                  {formData.specialRequests && (
                    <div style={styles.specialRequests}>
                      <div style={styles.reviewLabel}>Special Requests:</div>
                      <div style={styles.requestsText}>{formData.specialRequests}</div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div style={styles.reviewSection}>
                  <h3 style={styles.reviewTitle}>Payment Method</h3>
                  <div style={styles.paymentSummary}>
                    {formData.paymentMethod === 'card' && (
                      <>
                        <CreditCard size={24} color="#10b981" />
                        <div>
                          <div style={styles.paymentLabel}>Credit Card</div>
                          <div style={styles.paymentValue}>
                            •••• •••• •••• {formData.cardNumber.slice(-4)}
                          </div>
                        </div>
                      </>
                    )}
                    {formData.paymentMethod === 'paypal' && (
                      <>
                        <div style={styles.paypalIcon}>PayPal</div>
                        <div>
                          <div style={styles.paymentLabel}>PayPal</div>
                          <div style={styles.paymentValue}>{formData.guestEmail}</div>
                        </div>
                      </>
                    )}
                    {formData.paymentMethod === 'later' && (
                      <>
                        <Clock size={24} color="#10b981" />
                        <div>
                          <div style={styles.paymentLabel}>Pay at Hotel</div>
                          <div style={styles.paymentValue}>Payment upon arrival</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div style={styles.termsSection}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                      style={styles.checkbox}
                    />
                    <span>
                      I agree to the <a href="/terms" style={styles.link}>Terms & Conditions</a> and{' '}
                      <a href="/cancellation-policy" style={styles.link}>Cancellation Policy</a>
                    </span>
                  </label>
                  {errors.agreeToTerms && <div style={styles.error}>{errors.agreeToTerms}</div>}
                </div>

                {/* Important Notes */}
                <div style={styles.importantNotice}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <div>
                    <div style={styles.noticeTitle}>Important Information</div>
                    <ul style={styles.noticeList}>
                      <li>Free cancellation until 24 hours before check-in</li>
                      <li>Check-in time: 3:00 PM | Check-out time: 11:00 AM</li>
                      <li>Valid photo ID required at check-in</li>
                      <li>Confirmation email will be sent to {formData.guestEmail}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  style={styles.backButton}
                  className="back-btn"
                >
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  style={styles.nextButton}
                  className="next-btn"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  style={processing ? styles.submitButtonDisabled : styles.submitButton}
                  className="submit-btn"
                >
                  {processing ? (
                    <>
                      <div className="spinner-small" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Confirm & Pay ${pricing.total?.toFixed(2)}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div style={styles.summaryColumn}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Booking Summary</h3>

              {/* Hotel Info */}
              <div style={styles.hotelSummary}>
                <img
                  src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop'}
                  alt={hotel?.name}
                  style={styles.hotelImage}
                />
                <div style={styles.hotelInfo}>
                  <h4 style={styles.hotelName}>{hotel?.name}</h4>
                  <div style={styles.hotelLocation}>
                    <MapPin size={14} color="#6b7280" />
                    {hotel?.city || hotel?.location}
                  </div>
                  {hotel?.rating > 0 && (
                    <div style={styles.hotelRating}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {hotel.rating.toFixed(1)} ({hotel.reviewCount} reviews)
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div style={styles.summaryDates}>
                <div style={styles.dateItem}>
                  <div style={styles.dateLabel}>Check-in</div>
                  <div style={styles.dateValue}>
                    {bookingDetails?.checkIn && new Date(bookingDetails.checkIn).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div style={styles.dateDivider}>→</div>
                <div style={styles.dateItem}>
                  <div style={styles.dateLabel}>Check-out</div>
                  <div style={styles.dateValue}>
                    {bookingDetails?.checkOut && new Date(bookingDetails.checkOut).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div style={styles.summaryDetail}>
                {bookingDetails?.nights} night{bookingDetails?.nights !== 1 ? 's' : ''} • {bookingDetails?.rooms} room{bookingDetails?.rooms !== 1 ? 's' : ''}
              </div>

              {/* Price Breakdown */}
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>${hotel?.pricePerNight} × {bookingDetails?.nights} nights × {bookingDetails?.rooms} room{bookingDetails?.rooms !== 1 ? 's' : ''}</span>
                  <span>${pricing.subtotal?.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Taxes & Fees (12%)</span>
                  <span>${pricing.taxes?.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Service Fee</span>
                  <span>${pricing.fees?.toFixed(2)}</span>
                </div>

                {/* Loyalty Points Redemption */}
                {loyaltyData && loyaltyData.availablePoints > 0 && (
                  <>
                    <div style={styles.pointsSection}>
                      <div style={styles.pointsHeader}>
                        <Sparkles size={16} color="#10b981" />
                        <span style={styles.pointsTitle}>Use Loyalty Points</span>
                      </div>
                      <div style={styles.pointsAvailable}>
                        Available: {loyaltyData.availablePoints.toLocaleString()} pts (${(loyaltyData.availablePoints / 100).toFixed(2)})
                      </div>
                      <div style={styles.pointsInputContainer}>
                        <input
                          type="number"
                          value={pointsToRedeem}
                          onChange={(e) => applyPoints(parseInt(e.target.value) || 0)}
                          placeholder="Enter points"
                          min="0"
                          max={Math.min(loyaltyData.availablePoints, Math.floor(pricing.total * 100))}
                          style={styles.pointsInput}
                        />
                        <button
                          onClick={applyMaxPoints}
                          style={styles.maxPointsBtn}
                        >
                          Use Max
                        </button>
                      </div>
                      {pointsToRedeem > 0 && (
                        <div style={styles.pointsInfo}>
                          Redeeming {pointsToRedeem.toLocaleString()} points
                        </div>
                      )}
                    </div>

                    {pointsToRedeem > 0 && (
                      <div style={{...styles.priceRow, color: '#10b981'}}>
                        <span>Points Discount</span>
                        <span>-${pricing.pointsDiscount?.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                <div style={styles.totalRow}>
                  <span>Total</span>
                  <span>${pricing.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={styles.trustBadges}>
                <div style={styles.trustBadge}>
                  <Shield size={18} color="#10b981" />
                  <span>Secure Payment</span>
                </div>
                <div style={styles.trustBadge}>
                  <Check size={18} color="#10b981" />
                  <span>Instant Confirmation</span>
                </div>
                <div style={styles.trustBadge}>
                  <Lock size={18} color="#10b981" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
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
  progressSection: {
    background: 'white',
    borderBottom: '2px solid #f0fdf4',
    padding: '2rem 0',
  },
  progressContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  stepCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#f9fafb',
    border: '3px solid #e5e7eb',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  stepCircleActive: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#f0fdf4',
    border: '3px solid #10b981',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  stepCircleComplete: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: '3px solid #10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  stepLabel: {
    textAlign: 'center',
  },
  stepNumber: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  stepTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  stepLine: {
    flex: 1,
    height: '3px',
    background: '#e5e7eb',
    margin: '0 1rem',
    transition: 'all 0.3s',
  },
  stepLineComplete: {
    flex: 1,
    height: '3px',
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    margin: '0 1rem',
    transition: 'all 0.3s',
  },
  main: {
    padding: '3rem 2rem',
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '3rem',
  },
  formColumn: {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  stepContent: {
    marginBottom: '2rem',
  },
  stepHeading: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  stepSubheading: {
    fontSize: '1.05rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  input: {
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  inputError: {
    padding: '0.875rem 1rem',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    background: '#fef2f2',
  },
  select: {
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    background: 'white',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  error: {
    fontSize: '0.85rem',
    color: '#ef4444',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  paymentMethods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  paymentMethod: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.25rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4b5563',
  },
  paymentMethodActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.25rem',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#047857',
    transform: 'scale(1.05)',
  },
  paypalIcon: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0070ba',
  },
  cardForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#f0fdf4',
    borderRadius: '12px',
    color: '#047857',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  paypalNotice: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    background: '#eff6ff',
    borderRadius: '12px',
    border: '2px solid #bfdbfe',
    marginTop: '1rem',
  },
  laterNotice: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    background: '#fffbeb',
    borderRadius: '12px',
    border: '2px solid #fde68a',
    marginTop: '1rem',
  },
  noticeIcon: {
    fontSize: '2.5rem',
  },
  noticeTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  noticeText: {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: '1.6',
  },
  billingSection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px solid #f3f4f6',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  reviewSection: {
    background: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  reviewTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  reviewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  reviewLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  reviewValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  specialRequests: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  requestsText: {
    fontSize: '0.95rem',
    color: '#374151',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  },
  paymentSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  paymentLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  termsSection: {
    background: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    fontSize: '0.95rem',
    color: '#374151',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    marginTop: '2px',
  },
  link: {
    color: '#10b981',
    fontWeight: '600',
    textDecoration: 'none',
  },
  importantNotice: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    background: '#fffbeb',
    borderRadius: '12px',
    border: '2px solid #fde68a',
  },
  noticeList: {
    margin: '0.5rem 0 0 1.25rem',
    padding: 0,
    fontSize: '0.9rem',
    color: '#78350f',
    lineHeight: '1.8',
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px solid #f3f4f6',
  },
  backButton: {
    padding: '0.875rem 2rem',
    background: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    marginLeft: 'auto',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '1.125rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.125rem',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
  },
  submitButtonDisabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '1.125rem',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.125rem',
    fontWeight: '800',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  summaryColumn: {
    position: 'sticky',
    top: '20px',
    height: 'fit-content',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '2px solid #f0fdf4',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  hotelSummary: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #f3f4f6',
  },
  hotelImage: {
    width: '100px',
    height: '100px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
  },
  hotelLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  hotelRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#92400e',
  },
  summaryDates: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  dateValue: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  dateDivider: {
    fontSize: '1.5rem',
    color: '#10b981',
    fontWeight: '700',
  },
  summaryDetail: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #f3f4f6',
  },
  priceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    paddingTop: '1rem',
    marginTop: '1rem',
    borderTop: '2px solid #10b981',
  },
  pointsSection: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    padding: '1rem',
    borderRadius: '12px',
    border: '2px solid #10b981',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
  pointsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  pointsTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#047857',
  },
  pointsAvailable: {
    fontSize: '0.85rem',
    color: '#059669',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  pointsInputContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  pointsInput: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #10b981',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1f2937',
    background: 'white',
  },
  maxPointsBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  pointsInfo: {
    fontSize: '0.85rem',
    color: '#047857',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  trustBadges: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #f3f4f6',
  },
  trustBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#047857',
    textAlign: 'center',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input:focus, textarea:focus, select:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .payment-method-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
    }

    .back-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-2px);
    }

    .next-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.5);
    }

    .spinner-small {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .contentWrapper {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Checkout;
