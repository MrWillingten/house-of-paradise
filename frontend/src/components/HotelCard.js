import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Users, TrendingDown, TrendingUp, Eye, Clock, Zap,
  AlertCircle, Heart, Wifi, Car, Dumbbell, Coffee, Waves, Utensils,
  ChevronRight, Sparkles, Crown, Shield
} from 'lucide-react';
import hotelWebSocketService from '../services/hotelWebSocketService';

const HotelCard = ({ hotel, darkMode = false }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [realtimeData, setRealtimeData] = useState({
    viewerCount: hotel.currentViewers || 0,
    availableRooms: hotel.availableRooms || hotel.roomsAvailable,
    availabilityStatus: hotel.availabilityStatus || 'available'
  });

  useEffect(() => {
    // Subscribe to real-time updates for this hotel using centralized service
    const unsubscribe = hotelWebSocketService.subscribe(hotel._id, (eventType, data) => {
      switch (eventType) {
        case 'viewers-update':
          setRealtimeData(prev => ({
            ...prev,
            viewerCount: data.viewerCount,
            availableRooms: data.availableRooms,
            availabilityStatus: data.availabilityStatus
          }));
          break;

        case 'booking-created':
          setRealtimeData(prev => ({
            ...prev,
            availableRooms: data.availableRooms,
            availabilityStatus: data.availabilityStatus
          }));
          break;

        case 'price-drop':
          console.log('Price dropped!', data);
          break;

        case 'availability-change':
          setRealtimeData(prev => ({
            ...prev,
            availableRooms: data.availableRooms,
            availabilityStatus: data.availabilityStatus
          }));
          break;

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hotel._id]);

  const getAvailabilityConfig = () => {
    switch (realtimeData.availabilityStatus) {
      case 'almost_full':
        return {
          badge: 'Almost Full',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          textColor: 'white',
          icon: <AlertCircle size={12} />
        };
      case 'limited':
        return {
          badge: 'Limited',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          textColor: 'white',
          icon: <Clock size={12} />
        };
      case 'available':
        return null; // Don't show badge for available
      default:
        return null;
    }
  };

  const availabilityConfig = getAvailabilityConfig();

  const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi size={12} />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return <Car size={12} />;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return <Dumbbell size={12} />;
    if (lowerAmenity.includes('breakfast') || lowerAmenity.includes('coffee')) return <Coffee size={12} />;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('spa')) return <Waves size={12} />;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return <Utensils size={12} />;
    return <Sparkles size={12} />;
  };

  const getPropertyTypeGradient = () => {
    switch (hotel.propertyType?.toLowerCase()) {
      case 'resort':
        return 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)';
      case 'boutique':
        return 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
      case 'villa':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'apartment':
        return 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)';
      default:
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
  };

  const formatReviews = (reviews) => {
    if (reviews >= 1000) {
      return `${(reviews / 1000).toFixed(1)}k`;
    }
    return reviews;
  };

  const cardStyles = {
    card: {
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: darkMode
        ? '0 8px 32px rgba(0,0,0,0.4)'
        : '0 4px 24px rgba(0,0,0,0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      border: darkMode
        ? '1px solid rgba(16, 185, 129, 0.2)'
        : '1px solid rgba(0,0,0,0.06)',
      position: 'relative',
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
    },
    imageContainer: {
      position: 'relative',
      height: '220px',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
      pointerEvents: 'none',
    },
    favoriteButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 3,
    },
    badge: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 2,
    },
    propertyTypeBadge: {
      position: 'absolute',
      bottom: '12px',
      left: '12px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 2,
    },
    discountBadge: {
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
      zIndex: 2,
    },
    viewersBadge: {
      position: 'absolute',
      top: '56px',
      left: '12px',
      background: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '16px',
      fontSize: '0.7rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backdropFilter: 'blur(10px)',
      zIndex: 2,
    },
    content: {
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '0.75rem',
    },
    nameSection: {
      flex: 1,
    },
    name: {
      fontSize: '1.15rem',
      fontWeight: '700',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      marginBottom: '0.25rem',
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    location: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      fontSize: '0.85rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: '500',
    },
    ratingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.25rem',
    },
    ratingBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      background: darkMode ? 'rgba(251, 191, 36, 0.2)' : '#fffbeb',
      padding: '6px 10px',
      borderRadius: '10px',
      border: '1px solid rgba(251, 191, 36, 0.3)',
    },
    ratingValue: {
      fontSize: '1rem',
      fontWeight: '800',
      color: '#f59e0b',
    },
    reviewsCount: {
      fontSize: '0.7rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: '500',
    },
    amenities: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    amenityChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.7rem',
      padding: '4px 10px',
      background: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
      color: darkMode ? '#10b981' : '#047857',
      borderRadius: '8px',
      fontWeight: '600',
    },
    infoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '0.75rem',
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#f9fafb',
      borderRadius: '12px',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.8rem',
      fontWeight: '500',
    },
    priceTrend: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '8px 12px',
      borderRadius: '10px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingTop: '1rem',
      borderTop: darkMode
        ? '1px solid rgba(16, 185, 129, 0.1)'
        : '1px solid #f3f4f6',
    },
    priceSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
    },
    priceLabel: {
      fontSize: '0.7rem',
      color: darkMode ? '#6b7280' : '#9ca3af',
      fontWeight: '500',
    },
    originalPrice: {
      fontSize: '0.85rem',
      color: darkMode ? '#6b7280' : '#9ca3af',
      textDecoration: 'line-through',
      fontWeight: '500',
    },
    price: {
      fontSize: '1.75rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'baseline',
      gap: '0.25rem',
    },
    perNight: {
      fontSize: '0.8rem',
      fontWeight: '500',
      color: darkMode ? '#9ca3af' : '#6b7280',
      WebkitTextFillColor: darkMode ? '#9ca3af' : '#6b7280',
    },
    savings: {
      fontSize: '0.7rem',
      color: '#047857',
      fontWeight: '600',
      background: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
      padding: '3px 8px',
      borderRadius: '6px',
      display: 'inline-block',
      marginTop: '0.25rem',
    },
    bookButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1.5rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '0.9rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    },
  };

  return (
    <div
      style={cardStyles.card}
      onClick={() => navigate(`/hotel/${hotel._id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hotel-card-new"
    >
      {/* Image Container */}
      <div style={cardStyles.imageContainer}>
        <img
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
          alt={hotel.name}
          style={cardStyles.image}
          loading="lazy"
        />
        <div style={cardStyles.imageOverlay}></div>

        {/* Favorite Button */}
        <button
          style={{
            ...cardStyles.favoriteButton,
            background: isFavorite ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(255,255,255,0.95)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="favorite-btn"
        >
          <Heart
            size={18}
            color={isFavorite ? 'white' : '#6b7280'}
            fill={isFavorite ? 'white' : 'none'}
          />
        </button>

        {/* Availability Badge */}
        {availabilityConfig && (
          <div style={{
            ...cardStyles.badge,
            background: availabilityConfig.gradient,
            color: availabilityConfig.textColor,
          }}>
            {availabilityConfig.icon}
            <span>{availabilityConfig.badge}</span>
          </div>
        )}

        {/* Popular Badge */}
        {hotel.isPopular && (
          <div style={{
            ...cardStyles.badge,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            top: availabilityConfig ? '52px' : '12px',
          }}>
            <Zap size={12} />
            <span>Hot Deal</span>
          </div>
        )}

        {/* Property Type Badge */}
        <div style={{
          ...cardStyles.propertyTypeBadge,
          background: getPropertyTypeGradient(),
        }}>
          {hotel.propertyType || 'Hotel'}
        </div>

        {/* Discount Badge */}
        {hotel.discountPercent > 0 && (
          <div style={cardStyles.discountBadge}>
            {hotel.discountPercent}% OFF
          </div>
        )}

        {/* Real-Time Viewers */}
        {realtimeData.viewerCount > 0 && (
          <div style={cardStyles.viewersBadge}>
            <Eye size={12} />
            <span>{realtimeData.viewerCount} viewing now</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={cardStyles.content}>
        {/* Header */}
        <div style={cardStyles.header}>
          <div style={cardStyles.nameSection}>
            <h3 style={cardStyles.name}>{hotel.name}</h3>
            <div style={cardStyles.location}>
              <MapPin size={14} color="#10b981" />
              <span>{hotel.city || hotel.location}</span>
            </div>
          </div>

          {hotel.rating > 0 && (
            <div style={cardStyles.ratingContainer}>
              <div style={cardStyles.ratingBadge}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span style={cardStyles.ratingValue}>{hotel.rating.toFixed(1)}</span>
              </div>
              {hotel.reviews > 0 && (
                <span style={cardStyles.reviewsCount}>
                  {formatReviews(hotel.reviews)} reviews
                </span>
              )}
            </div>
          )}
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div style={cardStyles.amenities}>
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <div key={index} style={cardStyles.amenityChip}>
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
            {hotel.amenities.length > 4 && (
              <div style={{
                ...cardStyles.amenityChip,
                background: darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}>
                +{hotel.amenities.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div style={cardStyles.infoSection}>
          <div style={{
            ...cardStyles.infoItem,
            color: realtimeData.availableRooms <= 3 ? '#ef4444' :
                   realtimeData.availableRooms <= 10 ? '#f59e0b' : (darkMode ? '#9ca3af' : '#374151'),
          }}>
            <Users size={14} color={realtimeData.availableRooms <= 3 ? '#ef4444' :
                                    realtimeData.availableRooms <= 10 ? '#f59e0b' : '#10b981'} />
            <span>
              {realtimeData.availableRooms <= 1
                ? 'Only 1 room left!'
                : realtimeData.availableRooms <= 3
                  ? `Only ${realtimeData.availableRooms} rooms left!`
                  : `${realtimeData.availableRooms} rooms available`}
            </span>
          </div>

          {hotel.bookingCount24h > 3 && (
            <div style={{
              ...cardStyles.infoItem,
              color: '#ef4444',
            }}>
              <Zap size={14} color="#ef4444" />
              <span>{hotel.bookingCount24h} booked today</span>
            </div>
          )}
        </div>

        {/* Price Trend */}
        {hotel.priceTrend === 'down' && hotel.priceDropLast24h > 0 && (
          <div style={{
            ...cardStyles.priceTrend,
            background: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
            color: '#047857',
          }}>
            <TrendingDown size={14} />
            <span>Price dropped ${hotel.priceDropLast24h}</span>
          </div>
        )}

        {hotel.priceTrend === 'up' && (
          <div style={{
            ...cardStyles.priceTrend,
            background: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
            color: '#ef4444',
          }}>
            <TrendingUp size={14} />
            <span>Prices increasing</span>
          </div>
        )}

        {/* Footer */}
        <div style={cardStyles.footer}>
          <div style={cardStyles.priceSection}>
            <div style={cardStyles.priceLabel}>Starting from</div>
            {hotel.originalPrice && hotel.originalPrice > hotel.pricePerNight && (
              <div style={cardStyles.originalPrice}>${hotel.originalPrice}</div>
            )}
            <div style={cardStyles.price}>
              ${hotel.pricePerNight}
              <span style={cardStyles.perNight}>/night</span>
            </div>
            {hotel.discountPercent > 0 && hotel.originalPrice && (
              <div style={cardStyles.savings}>
                Save ${Math.round(hotel.originalPrice - hotel.pricePerNight)}
              </div>
            )}
          </div>

          <button
            style={cardStyles.bookButton}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hotel/${hotel._id}`);
            }}
            className="book-hotel-btn"
          >
            View
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add global styles for hover effects
if (typeof document !== 'undefined') {
  const styleId = 'hotel-card-new-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .hotel-card-new:hover {
        box-shadow: 0 20px 48px rgba(16, 185, 129, 0.2);
      }

      .book-hotel-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
      }

      .book-hotel-btn:active {
        transform: translateY(0);
      }

      .favorite-btn:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  }
}

export default HotelCard;
