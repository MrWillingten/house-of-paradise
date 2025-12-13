import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Train, Bus, Calendar, Clock, Users, MapPin,
  ArrowRight, Zap, TrendingDown, Star, Shield, Briefcase,
  Wifi, Coffee, Utensils, Tv, ChevronRight
} from 'lucide-react';

function TripCard({ trip, darkMode = false }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getTransportConfig = () => {
    switch(trip.transportType?.toLowerCase()) {
      case 'flight':
        return {
          icon: Plane,
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
          shadowColor: 'rgba(14, 165, 233, 0.4)',
          label: 'Flight',
          bgLight: '#f0f9ff',
          bgDark: 'rgba(14, 165, 233, 0.15)',
          textColor: '#0284c7'
        };
      case 'train':
        return {
          icon: Train,
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          shadowColor: 'rgba(139, 92, 246, 0.4)',
          label: 'Train',
          bgLight: '#faf5ff',
          bgDark: 'rgba(139, 92, 246, 0.15)',
          textColor: '#7c3aed'
        };
      case 'bus':
        return {
          icon: Bus,
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          label: 'Bus',
          bgLight: '#f0fdf4',
          bgDark: 'rgba(16, 185, 129, 0.15)',
          textColor: '#059669'
        };
      default:
        return {
          icon: Plane,
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          label: 'Travel',
          bgLight: '#f0fdf4',
          bgDark: 'rgba(16, 185, 129, 0.15)',
          textColor: '#059669'
        };
    }
  };

  const transportConfig = getTransportConfig();
  const TransportIcon = transportConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateDuration = () => {
    const departure = new Date(trip.departureTime);
    const arrival = new Date(trip.arrivalTime);
    const totalMinutes = Math.floor((arrival - departure) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getOriginCity = () => {
    return trip.origin?.split(',')[0] || trip.origin;
  };

  const getDestinationCity = () => {
    return trip.destination?.split(',')[0] || trip.destination;
  };

  // Calculate if seats are limited
  const isLimitedSeats = trip.availableSeats <= 20;
  const isAlmostFull = trip.availableSeats <= 5;

  // Random features for demo
  const hasWifi = Math.random() > 0.3;
  const hasMeals = trip.transportType === 'flight' || Math.random() > 0.5;
  const hasEntertainment = trip.transportType === 'flight' || Math.random() > 0.6;

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
    header: {
      padding: '1.25rem 1.5rem',
      background: darkMode
        ? 'rgba(16, 185, 129, 0.05)'
        : 'linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%)',
      borderBottom: darkMode
        ? '1px solid rgba(16, 185, 129, 0.1)'
        : '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    carrierInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    transportIconWrapper: {
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      background: transportConfig.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: `0 4px 16px ${transportConfig.shadowColor}`,
    },
    carrierDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
    },
    carrierName: {
      fontSize: '1rem',
      fontWeight: '700',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    },
    transportType: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: transportConfig.textColor,
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    badges: {
      display: 'flex',
      gap: '0.5rem',
    },
    badge: {
      padding: '0.375rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    body: {
      padding: '1.5rem',
    },
    routeContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.25rem',
      position: 'relative',
    },
    locationBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      flex: 1,
    },
    locationBlockRight: {
      textAlign: 'right',
    },
    timeLabel: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      letterSpacing: '-0.02em',
    },
    cityLabel: {
      fontSize: '0.95rem',
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    dateLabel: {
      fontSize: '0.8rem',
      color: darkMode ? '#6b7280' : '#9ca3af',
      fontWeight: '500',
    },
    routeLine: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 1.5rem',
      position: 'relative',
    },
    durationBubble: {
      background: darkMode ? transportConfig.bgDark : transportConfig.bgLight,
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.125rem',
      position: 'relative',
      zIndex: 1,
    },
    durationText: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: transportConfig.textColor,
    },
    directLabel: {
      fontSize: '0.65rem',
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    routeDots: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '2px',
      background: darkMode
        ? 'repeating-linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0px, rgba(16, 185, 129, 0.3) 6px, transparent 6px, transparent 12px)'
        : 'repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 6px, transparent 6px, transparent 12px)',
      transform: 'translateY(-50%)',
    },
    features: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '1rem',
    },
    featureChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.375rem 0.75rem',
      background: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
      borderRadius: '8px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#6b7280',
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
      gap: '0.25rem',
    },
    priceLabel: {
      fontSize: '0.75rem',
      color: darkMode ? '#6b7280' : '#9ca3af',
      fontWeight: '500',
    },
    price: {
      fontSize: '2rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1,
    },
    perPerson: {
      fontSize: '0.8rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: '500',
    },
    seatsInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      marginTop: '0.375rem',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: isAlmostFull ? '#ef4444' : isLimitedSeats ? '#f59e0b' : '#10b981',
    },
    bookButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1.75rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '0.95rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    },
  };

  return (
    <div
      style={cardStyles.card}
      onClick={() => navigate(`/trip/${trip.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="trip-card"
    >
      {/* Header */}
      <div style={cardStyles.header}>
        <div style={cardStyles.carrierInfo}>
          <div style={cardStyles.transportIconWrapper}>
            <TransportIcon size={24} />
          </div>
          <div style={cardStyles.carrierDetails}>
            <div style={cardStyles.carrierName}>{trip.carrier || 'Premium Carrier'}</div>
            <div style={cardStyles.transportType}>
              <TransportIcon size={12} />
              {transportConfig.label}
            </div>
          </div>
        </div>

        <div style={cardStyles.badges}>
          {isAlmostFull && (
            <div style={{
              ...cardStyles.badge,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
            }}>
              <Zap size={12} />
              Almost Full
            </div>
          )}
          {isLimitedSeats && !isAlmostFull && (
            <div style={{
              ...cardStyles.badge,
              background: darkMode ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              <Clock size={12} />
              Limited
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={cardStyles.body}>
        {/* Route */}
        <div style={cardStyles.routeContainer}>
          <div style={cardStyles.locationBlock}>
            <div style={cardStyles.timeLabel}>{formatTime(trip.departureTime)}</div>
            <div style={cardStyles.cityLabel}>{getOriginCity()}</div>
            <div style={cardStyles.dateLabel}>{formatDate(trip.departureTime)}</div>
          </div>

          <div style={cardStyles.routeLine}>
            <div style={cardStyles.routeDots}></div>
            <div style={cardStyles.durationBubble}>
              <div style={cardStyles.durationText}>{calculateDuration()}</div>
              <div style={cardStyles.directLabel}>Direct</div>
            </div>
          </div>

          <div style={{...cardStyles.locationBlock, ...cardStyles.locationBlockRight}}>
            <div style={cardStyles.timeLabel}>{formatTime(trip.arrivalTime)}</div>
            <div style={cardStyles.cityLabel}>{getDestinationCity()}</div>
            <div style={cardStyles.dateLabel}>{formatDate(trip.arrivalTime)}</div>
          </div>
        </div>

        {/* Features */}
        <div style={cardStyles.features}>
          {hasWifi && (
            <div style={cardStyles.featureChip}>
              <Wifi size={14} color="#10b981" />
              Free WiFi
            </div>
          )}
          {hasMeals && (
            <div style={cardStyles.featureChip}>
              <Utensils size={14} color="#f59e0b" />
              {trip.transportType === 'flight' ? 'In-flight Meals' : 'Snacks'}
            </div>
          )}
          {hasEntertainment && (
            <div style={cardStyles.featureChip}>
              <Tv size={14} color="#8b5cf6" />
              Entertainment
            </div>
          )}
          <div style={cardStyles.featureChip}>
            <Briefcase size={14} color="#6b7280" />
            {trip.transportType === 'flight' ? '23kg Baggage' : 'Luggage'}
          </div>
        </div>

        {/* Footer */}
        <div style={cardStyles.footer}>
          <div style={cardStyles.priceSection}>
            <div style={cardStyles.priceLabel}>Starting from</div>
            <div style={cardStyles.price}>${trip.price}</div>
            <div style={cardStyles.perPerson}>per person</div>
            <div style={cardStyles.seatsInfo}>
              <Users size={14} />
              {isAlmostFull
                ? `Only ${trip.availableSeats} seats left!`
                : isLimitedSeats
                  ? `${trip.availableSeats} seats remaining`
                  : `${trip.availableSeats} seats available`
              }
            </div>
          </div>

          <button
            style={cardStyles.bookButton}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trip/${trip.id}`);
            }}
            className="book-trip-btn"
          >
            Select
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add global styles
if (typeof document !== 'undefined') {
  const styleId = 'trip-card-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .trip-card:hover {
        box-shadow: 0 20px 48px rgba(16, 185, 129, 0.2);
      }

      .book-trip-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
      }

      .book-trip-btn:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
}

export default TripCard;
