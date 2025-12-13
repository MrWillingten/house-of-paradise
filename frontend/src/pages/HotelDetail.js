import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/api';
import {
  MapPin, Star, Calendar, Users, ArrowLeft, Heart, Share2,
  Wifi, Car, Coffee, Utensils, Dumbbell, Waves, Sparkles,
  Wind, Tv, Phone, Shield, Clock, ChevronLeft, ChevronRight,
  Check, X, Building2, Bed, Bath, Eye, TrendingUp, Award,
  ThumbsUp, MessageCircle, Camera, Navigation, Zap, Crown,
  Percent, Gift, CreditCard, Lock, CheckCircle2, AlertCircle,
  Globe, Plane, Train, Bus, Sunrise, Moon, Sun, Umbrella
} from 'lucide-react';

// Amenity icon mapping
const amenityIcons = {
  'WiFi': Wifi,
  'Free WiFi': Wifi,
  'Parking': Car,
  'Free Parking': Car,
  'Restaurant': Utensils,
  'Room Service': Coffee,
  'Gym': Dumbbell,
  'Fitness Center': Dumbbell,
  'Pool': Waves,
  'Swimming Pool': Waves,
  'Spa': Sparkles,
  'Air Conditioning': Wind,
  'TV': Tv,
  'Cable TV': Tv,
  'Phone': Phone,
  '24/7 Security': Shield,
  '24-Hour Front Desk': Clock,
  'Concierge': Award,
  'Bar': Coffee,
  'Lounge': Coffee,
  'Business Center': Building2,
  'Meeting Rooms': Building2,
  'Laundry': Sparkles,
  'Pet Friendly': Heart,
  'Airport Shuttle': Plane,
  'Beach Access': Umbrella,
  'Garden': Sunrise,
  'Balcony': Sun,
  'Kitchen': Utensils,
  'Mini Bar': Coffee,
  'Safe': Lock,
  'Elevator': Building2,
  'Non-Smoking Rooms': Wind,
  'Family Rooms': Users,
  'Accessible': Check,
  'EV Charging': Zap,
  'Heating': Sun,
  'Terrace': Sunrise,
};

function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    numberOfRooms: 1,
    guests: 2,
  });
  const [bookingError, setBookingError] = useState('');

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

  useEffect(() => {
    fetchHotel();
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [id]);

  const fetchHotel = async () => {
    try {
      const response = await hotelService.getById(id);
      setHotel(response.data.data);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  };

  const nights = useMemo(() => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }, [bookingData.checkIn, bookingData.checkOut]);

  const calculateTotalPrice = () => {
    if (!nights || !hotel) return 0;
    return nights * hotel.pricePerNight * bookingData.numberOfRooms;
  };

  const handleBooking = () => {
    setBookingError('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { from: `/hotels/${id}` } });
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);

    if (checkOut <= checkIn) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    navigate('/checkout', {
      state: {
        hotel: hotel,
        bookingDetails: {
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          rooms: bookingData.numberOfRooms,
          guests: bookingData.guests,
          nights: nights,
          totalPrice: calculateTotalPrice(),
        }
      }
    });
  };

  const nextImage = () => {
    if (hotel?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const prevImage = () => {
    if (hotel?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
  };

  const getAmenityIcon = (amenity) => {
    const IconComponent = Object.entries(amenityIcons).find(([key]) =>
      amenity.toLowerCase().includes(key.toLowerCase())
    )?.[1] || Check;
    return IconComponent;
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'resort': return Crown;
      case 'boutique': return Sparkles;
      case 'apartment': return Building2;
      case 'villa': return Sunrise;
      default: return Building2;
    }
  };

  // Generate fake reviews for display
  const fakeReviews = [
    { id: 1, name: 'Sarah M.', rating: 5, date: '2 weeks ago', comment: 'Absolutely stunning property! The views were breathtaking and the staff went above and beyond.', avatar: 'S' },
    { id: 2, name: 'James R.', rating: 4, date: '1 month ago', comment: 'Great location and excellent amenities. The room was spacious and clean. Would definitely stay again.', avatar: 'J' },
    { id: 3, name: 'Emily K.', rating: 5, date: '1 month ago', comment: 'Perfect getaway! The spa was incredible and the restaurant served amazing food. Highly recommend!', avatar: 'E' },
  ];

  const styles = getStyles(darkMode);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={64} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h2 style={styles.errorTitle}>Hotel Not Found</h2>
        <p style={styles.errorText}>The hotel you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/hotels')} style={styles.errorButton}>
          Browse Hotels
        </button>
      </div>
    );
  }

  const PropertyIcon = getPropertyTypeIcon(hotel.propertyType);
  const displayedAmenities = showAllAmenities ? hotel.amenities : hotel.amenities?.slice(0, 8);
  const hasMoreAmenities = hotel.amenities?.length > 8;

  // Get hotel images or use placeholders
  const hotelImages = hotel.images?.length > 0
    ? hotel.images
    : [
        `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop`,
        `https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop`,
        `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop`,
        `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop`,
      ];

  return (
    <div style={styles.pageContainer}>
      {/* Hero Image Gallery */}
      <div style={styles.heroSection}>
        <div style={styles.imageGallery}>
          <div style={styles.mainImageContainer}>
            <img
              src={hotelImages[currentImageIndex]}
              alt={hotel.name}
              style={styles.mainImage}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop';
              }}
            />
            <div style={styles.imageOverlay}></div>

            {/* Navigation Arrows */}
            {hotelImages.length > 1 && (
              <>
                <button onClick={prevImage} style={{...styles.imageNav, left: '1rem'}}>
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} style={{...styles.imageNav, right: '1rem'}}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div style={styles.imageCounter}>
              <Camera size={16} />
              <span>{currentImageIndex + 1} / {hotelImages.length}</span>
            </div>

            {/* Back Button */}
            <button onClick={() => navigate('/hotels')} style={styles.backButton}>
              <ArrowLeft size={20} />
              <span>Back to Hotels</span>
            </button>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                style={{...styles.actionBtn, ...(isFavorite ? styles.actionBtnActive : {})}}
              >
                <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : 'white'} />
              </button>
              <button style={styles.actionBtn}>
                <Share2 size={20} />
              </button>
            </div>

            {/* Property Type Badge */}
            <div style={styles.propertyBadge}>
              <PropertyIcon size={16} />
              <span>{hotel.propertyType || 'Hotel'}</span>
            </div>

            {/* Rating Badge */}
            <div style={styles.ratingBadge}>
              <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
              <span style={styles.ratingValue}>{hotel.rating?.toFixed(1) || '4.5'}</span>
              <span style={styles.reviewCount}>({hotel.reviews || 0} reviews)</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {hotelImages.length > 1 && (
            <div style={styles.thumbnailStrip}>
              {hotelImages.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{
                    ...styles.thumbnail,
                    ...(idx === currentImageIndex ? styles.thumbnailActive : {})
                  }}
                >
                  <img
                    src={img}
                    alt={`View ${idx + 1}`}
                    style={styles.thumbnailImg}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                    }}
                  />
                  {idx === 4 && hotelImages.length > 5 && (
                    <div style={styles.moreImages}>+{hotelImages.length - 5}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentGrid}>
          {/* Left Column - Details */}
          <div style={styles.leftColumn}>
            {/* Hotel Header */}
            <div style={styles.hotelHeader}>
              <div style={styles.headerTop}>
                <div>
                  <h1 style={styles.hotelName}>{hotel.name}</h1>
                  <div style={styles.locationRow}>
                    <MapPin size={18} style={styles.locationIcon} />
                    <span style={styles.locationText}>{hotel.location}</span>
                    {hotel.country && (
                      <>
                        <span style={styles.locationDivider}>•</span>
                        <Globe size={16} style={styles.locationIcon} />
                        <span style={styles.countryText}>{hotel.country}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={styles.quickStats}>
                <div style={styles.statItem}>
                  <div style={styles.statIcon}>
                    <Bed size={20} />
                  </div>
                  <div style={styles.statInfo}>
                    <span style={styles.statValue}>{hotel.roomsAvailable || hotel.availableRooms || 10}</span>
                    <span style={styles.statLabel}>Rooms Available</span>
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statIcon}>
                    <Eye size={20} />
                  </div>
                  <div style={styles.statInfo}>
                    <span style={styles.statValue}>{Math.floor(Math.random() * 20) + 5}</span>
                    <span style={styles.statLabel}>Viewing Now</span>
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                    <TrendingUp size={20} />
                  </div>
                  <div style={styles.statInfo}>
                    <span style={{...styles.statValue, color: '#10b981'}}>Popular</span>
                    <span style={styles.statLabel}>High Demand</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={styles.tabsContainer}>
              {['overview', 'amenities', 'reviews', 'location'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab ? styles.tabActive : {})
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Sparkles size={22} style={styles.sectionIcon} />
                  About This Property
                </h2>
                <p style={styles.description}>
                  {hotel.description || `Welcome to ${hotel.name}, a stunning ${hotel.propertyType || 'hotel'} located in the heart of ${hotel.location}. Experience unparalleled comfort and world-class amenities during your stay. Our dedicated staff is committed to making your visit unforgettable, whether you're here for business or leisure.`}
                </p>

                {/* Highlights */}
                <div style={styles.highlights}>
                  <div style={styles.highlight}>
                    <div style={styles.highlightIcon}>
                      <Award size={24} />
                    </div>
                    <div style={styles.highlightContent}>
                      <h4 style={styles.highlightTitle}>Top Rated</h4>
                      <p style={styles.highlightText}>Consistently rated {hotel.rating?.toFixed(1) || '4.5'}+ by guests</p>
                    </div>
                  </div>
                  <div style={styles.highlight}>
                    <div style={styles.highlightIcon}>
                      <MapPin size={24} />
                    </div>
                    <div style={styles.highlightContent}>
                      <h4 style={styles.highlightTitle}>Prime Location</h4>
                      <p style={styles.highlightText}>Close to major attractions and transport</p>
                    </div>
                  </div>
                  <div style={styles.highlight}>
                    <div style={styles.highlightIcon}>
                      <Shield size={24} />
                    </div>
                    <div style={styles.highlightContent}>
                      <h4 style={styles.highlightTitle}>Enhanced Safety</h4>
                      <p style={styles.highlightText}>COVID-safe protocols in place</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Check size={22} style={styles.sectionIcon} />
                  Amenities & Services
                </h2>

                {hotel.amenities && hotel.amenities.length > 0 ? (
                  <div style={styles.amenitiesGrid}>
                    {hotel.amenities.map((amenity, index) => {
                      const IconComponent = getAmenityIcon(amenity);
                      return (
                        <div key={index} style={styles.amenityItem}>
                          <div style={styles.amenityIcon}>
                            <IconComponent size={20} />
                          </div>
                          <span style={styles.amenityText}>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={styles.noContent}>No amenities listed for this property.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <MessageCircle size={22} style={styles.sectionIcon} />
                  Guest Reviews
                </h2>

                {/* Rating Summary */}
                <div style={styles.ratingSummary}>
                  <div style={styles.ratingOverall}>
                    <span style={styles.ratingBig}>{hotel.rating?.toFixed(1) || '4.5'}</span>
                    <div style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={star <= Math.round(hotel.rating || 4.5) ? '#fbbf24' : 'none'}
                          stroke="#fbbf24"
                        />
                      ))}
                    </div>
                    <span style={styles.ratingLabel}>Based on {hotel.reviews || 0} reviews</span>
                  </div>
                  <div style={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} style={styles.ratingBar}>
                        <span style={styles.ratingBarLabel}>{rating}</span>
                        <div style={styles.ratingBarTrack}>
                          <div
                            style={{
                              ...styles.ratingBarFill,
                              width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div style={styles.reviewsList}>
                  {fakeReviews.map((review) => (
                    <div key={review.id} style={styles.reviewCard}>
                      <div style={styles.reviewHeader}>
                        <div style={styles.reviewAvatar}>{review.avatar}</div>
                        <div style={styles.reviewMeta}>
                          <span style={styles.reviewName}>{review.name}</span>
                          <span style={styles.reviewDate}>{review.date}</span>
                        </div>
                        <div style={styles.reviewRating}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= review.rating ? '#fbbf24' : 'none'}
                              stroke="#fbbf24"
                            />
                          ))}
                        </div>
                      </div>
                      <p style={styles.reviewComment}>{review.comment}</p>
                      <div style={styles.reviewActions}>
                        <button style={styles.reviewAction}>
                          <ThumbsUp size={14} />
                          Helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Navigation size={22} style={styles.sectionIcon} />
                  Location & Surroundings
                </h2>

                {/* Map Placeholder */}
                <div style={styles.mapPlaceholder}>
                  <MapPin size={48} style={{ color: '#10b981' }} />
                  <h3 style={styles.mapTitle}>{hotel.location}</h3>
                  <p style={styles.mapSubtitle}>{hotel.country || 'Discover the area'}</p>
                </div>

                {/* Nearby Places */}
                <div style={styles.nearbyPlaces}>
                  <h3 style={styles.nearbyTitle}>What's Nearby</h3>
                  <div style={styles.nearbyGrid}>
                    <div style={styles.nearbyItem}>
                      <Plane size={18} style={styles.nearbyIcon} />
                      <div>
                        <span style={styles.nearbyName}>International Airport</span>
                        <span style={styles.nearbyDistance}>25 km</span>
                      </div>
                    </div>
                    <div style={styles.nearbyItem}>
                      <Train size={18} style={styles.nearbyIcon} />
                      <div>
                        <span style={styles.nearbyName}>Central Station</span>
                        <span style={styles.nearbyDistance}>3 km</span>
                      </div>
                    </div>
                    <div style={styles.nearbyItem}>
                      <Building2 size={18} style={styles.nearbyIcon} />
                      <div>
                        <span style={styles.nearbyName}>City Center</span>
                        <span style={styles.nearbyDistance}>1.5 km</span>
                      </div>
                    </div>
                    <div style={styles.nearbyItem}>
                      <Umbrella size={18} style={styles.nearbyIcon} />
                      <div>
                        <span style={styles.nearbyName}>Beach</span>
                        <span style={styles.nearbyDistance}>500 m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities Preview (always visible in overview) */}
            {activeTab === 'overview' && hotel.amenities && hotel.amenities.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>
                    <Check size={22} style={styles.sectionIcon} />
                    Popular Amenities
                  </h2>
                  {hasMoreAmenities && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      style={styles.showMoreBtn}
                    >
                      {showAllAmenities ? 'Show Less' : `Show All (${hotel.amenities.length})`}
                    </button>
                  )}
                </div>
                <div style={styles.amenitiesGrid}>
                  {displayedAmenities.map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={index} style={styles.amenityItem}>
                        <div style={styles.amenityIcon}>
                          <IconComponent size={20} />
                        </div>
                        <span style={styles.amenityText}>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Widget */}
          <div style={styles.rightColumn}>
            <div style={styles.bookingCard}>
              {/* Price Header */}
              <div style={styles.priceHeader}>
                <div style={styles.priceMain}>
                  <span style={styles.priceAmount}>${hotel.pricePerNight}</span>
                  <span style={styles.priceUnit}>/night</span>
                </div>
                <div style={styles.priceCompare}>
                  <TrendingUp size={14} style={{ color: '#10b981' }} />
                  <span>Best price guarantee</span>
                </div>
              </div>

              {/* Booking Form */}
              <div style={styles.bookingForm}>
                <div style={styles.dateInputs}>
                  <div style={styles.dateInput}>
                    <label style={styles.inputLabel}>
                      <Calendar size={16} />
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                      style={styles.input}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div style={styles.dateInput}>
                    <label style={styles.inputLabel}>
                      <Calendar size={16} />
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                      style={styles.input}
                      min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div style={styles.guestInputs}>
                  <div style={styles.guestInput}>
                    <label style={styles.inputLabel}>
                      <Bed size={16} />
                      Rooms
                    </label>
                    <select
                      value={bookingData.numberOfRooms}
                      onChange={(e) => setBookingData({...bookingData, numberOfRooms: parseInt(e.target.value)})}
                      style={styles.select}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.guestInput}>
                    <label style={styles.inputLabel}>
                      <Users size={16} />
                      Guests
                    </label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                      style={styles.select}
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div style={styles.priceBreakdown}>
                    <div style={styles.priceRow}>
                      <span>${hotel.pricePerNight} x {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>${hotel.pricePerNight * nights}</span>
                    </div>
                    {bookingData.numberOfRooms > 1 && (
                      <div style={styles.priceRow}>
                        <span>x {bookingData.numberOfRooms} rooms</span>
                        <span>${hotel.pricePerNight * nights * bookingData.numberOfRooms}</span>
                      </div>
                    )}
                    <div style={styles.priceRow}>
                      <span>Service fee</span>
                      <span>$0</span>
                    </div>
                    <div style={styles.priceDivider}></div>
                    <div style={styles.priceTotal}>
                      <span>Total</span>
                      <span style={styles.totalAmount}>${calculateTotalPrice()}</span>
                    </div>
                  </div>
                )}

                {/* Booking Error Message */}
                {bookingError && (
                  <div style={styles.bookingError}>
                    <AlertCircle size={16} />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  style={styles.bookButton}
                >
                  <CreditCard size={20} />
                  Reserve Now
                </button>

                {/* Assurances */}
                <div style={styles.assurances}>
                  <div style={styles.assurance}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span>Free cancellation</span>
                  </div>
                  <div style={styles.assurance}>
                    <Lock size={16} style={{ color: '#10b981' }} />
                    <span>Secure payment</span>
                  </div>
                  <div style={styles.assurance}>
                    <Gift size={16} style={{ color: '#10b981' }} />
                    <span>Earn loyalty points</span>
                  </div>
                </div>
              </div>

              {/* Limited Time Offer */}
              <div style={styles.offerBanner}>
                <Percent size={18} />
                <div>
                  <strong>Limited Time Offer!</strong>
                  <span>Book now and save up to 15%</span>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div style={styles.helpCard}>
              <Phone size={24} style={styles.helpIcon} />
              <h3 style={styles.helpTitle}>Need Help?</h3>
              <p style={styles.helpText}>Our travel experts are available 24/7</p>
              <button style={styles.helpButton}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .booking-card-enter {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}

const getStyles = (darkMode) => ({
  pageContainer: {
    minHeight: '100vh',
    background: darkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },

  // Loading State
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: darkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(16, 185, 129, 0.2)',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    color: darkMode ? '#94a3b8' : '#64748b',
    fontSize: '1.1rem',
    fontWeight: '500',
  },

  // Error State
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '2rem',
    background: darkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },
  errorTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '0.5rem',
  },
  errorText: {
    color: darkMode ? '#94a3b8' : '#64748b',
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
  },
  errorButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // Hero Section
  heroSection: {
    position: 'relative',
  },
  imageGallery: {
    position: 'relative',
  },
  mainImageContainer: {
    position: 'relative',
    height: '500px',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
    pointerEvents: 'none',
  },
  imageNav: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    zIndex: 10,
  },
  imageCounter: {
    position: 'absolute',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: '1.5rem',
    left: '1.5rem',
    background: 'rgba(255,255,255,0.95)',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    zIndex: 10,
  },
  actionButtons: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    display: 'flex',
    gap: '0.75rem',
    zIndex: 10,
  },
  actionBtn: {
    background: 'rgba(0,0,0,0.5)',
    border: '2px solid rgba(255,255,255,0.3)',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.2s ease',
  },
  actionBtnActive: {
    background: 'rgba(255,255,255,0.95)',
    borderColor: 'transparent',
  },
  propertyBadge: {
    position: 'absolute',
    bottom: '1.5rem',
    left: '1.5rem',
    background: 'rgba(255,255,255,0.95)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: '1.5rem',
    right: '1.5rem',
    background: 'rgba(255,255,255,0.95)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ratingValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: '0.85rem',
    color: '#64748b',
  },

  // Thumbnails
  thumbnailStrip: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: darkMode ? '#1e293b' : 'white',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: '100px',
    height: '70px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    border: '3px solid transparent',
    transition: 'all 0.2s ease',
    opacity: 0.7,
  },
  thumbnailActive: {
    borderColor: '#10b981',
    opacity: 1,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  moreImages: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1rem',
  },

  // Main Content
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rightColumn: {
    position: 'sticky',
    top: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },

  // Hotel Header
  hotelHeader: {
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
  },
  headerTop: {
    marginBottom: '1.5rem',
  },
  hotelName: {
    fontSize: '2rem',
    fontWeight: '800',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '0.75rem',
    lineHeight: 1.2,
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  locationIcon: {
    color: '#10b981',
    flexShrink: 0,
  },
  locationText: {
    color: darkMode ? '#94a3b8' : '#64748b',
    fontSize: '1rem',
  },
  locationDivider: {
    color: darkMode ? '#475569' : '#cbd5e1',
    margin: '0 0.25rem',
  },
  countryText: {
    color: darkMode ? '#94a3b8' : '#64748b',
    fontSize: '1rem',
  },
  quickStats: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '12px',
    flex: 1,
    minWidth: '140px',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: darkMode
      ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: darkMode ? '#64748b' : '#94a3b8',
  },

  // Tabs
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    background: darkMode ? '#1e293b' : 'white',
    padding: '0.5rem',
    borderRadius: '16px',
    boxShadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
  },
  tab: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    border: 'none',
    background: 'transparent',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: darkMode ? '#94a3b8' : '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
  },

  // Sections
  section: {
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.35rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '1.5rem',
  },
  sectionIcon: {
    color: '#10b981',
  },
  description: {
    color: darkMode ? '#94a3b8' : '#64748b',
    fontSize: '1rem',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },
  showMoreBtn: {
    background: 'transparent',
    border: 'none',
    color: '#10b981',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  noContent: {
    color: darkMode ? '#64748b' : '#94a3b8',
    fontSize: '1rem',
    textAlign: 'center',
    padding: '2rem',
  },

  // Highlights
  highlights: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  highlight: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.25rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '12px',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  },
  highlightIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
    flexShrink: 0,
  },
  highlightContent: {},
  highlightTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '0.25rem',
  },
  highlightText: {
    fontSize: '0.85rem',
    color: darkMode ? '#94a3b8' : '#64748b',
    lineHeight: 1.5,
  },

  // Amenities
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  amenityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '10px',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  },
  amenityIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
    flexShrink: 0,
  },
  amenityText: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: darkMode ? '#e2e8f0' : '#374151',
  },

  // Reviews
  ratingSummary: {
    display: 'flex',
    gap: '2rem',
    padding: '1.5rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '16px',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  ratingOverall: {
    textAlign: 'center',
    padding: '1rem 2rem',
    borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  },
  ratingBig: {
    display: 'block',
    fontSize: '3rem',
    fontWeight: '800',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  ratingStars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.25rem',
    marginBottom: '0.5rem',
  },
  ratingLabel: {
    fontSize: '0.85rem',
    color: darkMode ? '#64748b' : '#94a3b8',
  },
  ratingBars: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  ratingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  ratingBarLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: darkMode ? '#94a3b8' : '#64748b',
    width: '20px',
    textAlign: 'center',
  },
  ratingBarTrack: {
    flex: 1,
    height: '8px',
    background: darkMode ? '#334155' : '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '4px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  reviewCard: {
    padding: '1.5rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '12px',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  reviewAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  reviewMeta: {
    flex: 1,
  },
  reviewName: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: darkMode ? '#f1f5f9' : '#1e293b',
  },
  reviewDate: {
    fontSize: '0.85rem',
    color: darkMode ? '#64748b' : '#94a3b8',
  },
  reviewRating: {
    display: 'flex',
    gap: '0.125rem',
  },
  reviewComment: {
    color: darkMode ? '#94a3b8' : '#64748b',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
  },
  reviewActions: {
    display: 'flex',
    gap: '1rem',
  },
  reviewAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'transparent',
    border: 'none',
    color: darkMode ? '#64748b' : '#94a3b8',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },

  // Location
  mapPlaceholder: {
    height: '250px',
    background: darkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    border: darkMode ? '2px dashed #334155' : '2px dashed #cbd5e1',
  },
  mapTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginTop: '1rem',
    marginBottom: '0.25rem',
  },
  mapSubtitle: {
    color: darkMode ? '#64748b' : '#94a3b8',
    fontSize: '0.95rem',
  },
  nearbyPlaces: {},
  nearbyTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '1rem',
  },
  nearbyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  nearbyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '10px',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  },
  nearbyIcon: {
    color: '#10b981',
  },
  nearbyName: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: darkMode ? '#e2e8f0' : '#374151',
  },
  nearbyDistance: {
    fontSize: '0.8rem',
    color: darkMode ? '#64748b' : '#94a3b8',
  },

  // Booking Card
  bookingCard: {
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : '0 8px 30px rgba(0,0,0,0.12)',
    border: darkMode ? '1px solid #334155' : '1px solid rgba(16, 185, 129, 0.2)',
  },
  priceHeader: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
  },
  priceMain: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
    marginBottom: '0.5rem',
  },
  priceAmount: {
    fontSize: '2.25rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  priceUnit: {
    fontSize: '1rem',
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  priceCompare: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.85rem',
    color: '#10b981',
    fontWeight: '500',
  },

  // Booking Form
  bookingForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  dateInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  dateInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  input: {
    padding: '0.875rem',
    border: darkMode ? '2px solid #334155' : '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    background: darkMode ? '#0f172a' : '#f8fafc',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  guestInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  guestInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  select: {
    padding: '0.875rem',
    border: darkMode ? '2px solid #334155' : '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    background: darkMode ? '#0f172a' : '#f8fafc',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    outline: 'none',
    cursor: 'pointer',
  },
  priceBreakdown: {
    padding: '1.25rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  priceDivider: {
    height: '1px',
    background: darkMode ? '#334155' : '#e2e8f0',
    margin: '0.5rem 0',
  },
  priceTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
  },
  totalAmount: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  bookButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
  },
  bookButtonDisabled: {
    background: darkMode ? '#334155' : '#e2e8f0',
    color: darkMode ? '#64748b' : '#94a3b8',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  bookingError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  assurances: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    paddingTop: '1rem',
  },
  assurance: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  offerBanner: {
    marginTop: '1.25rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },

  // Help Card
  helpCard: {
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
  },
  helpIcon: {
    color: '#10b981',
    marginBottom: '0.75rem',
  },
  helpTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    marginBottom: '0.25rem',
  },
  helpText: {
    fontSize: '0.9rem',
    color: darkMode ? '#64748b' : '#94a3b8',
    marginBottom: '1rem',
  },
  helpButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'transparent',
    border: darkMode ? '2px solid #334155' : '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
});

export default HotelDetail;
