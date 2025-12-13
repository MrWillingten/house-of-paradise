import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, TrendingDown, Check, X, Star, MapPin } from 'lucide-react';
import api from '../services/api';

const PriceAlerts = ({ userId }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      const response = await api.get(
        `/api/personalization/price-alerts/${userId}`
      );
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching price alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Bell size={24} color="#10b981" />
        <h2 style={styles.title}>Active Price Alerts</h2>
      </div>

      <div style={styles.alertsList}>
        {alerts.map((alert) => {
          const hotel = alert.hotelId;
          const isTriggered = alert.triggered;
          const currentPrice = hotel.pricePerNight;
          const targetPrice = alert.targetPrice;
          const difference = targetPrice - currentPrice;

          return (
            <div
              key={alert._id}
              style={isTriggered ? styles.alertTriggered : styles.alert}
              className="price-alert"
              onClick={() => navigate(`/hotel/${hotel._id}`)}
            >
              {isTriggered && (
                <div style={styles.triggeredBanner}>
                  <Check size={16} />
                  <span>Target price reached!</span>
                </div>
              )}

              <div style={styles.alertContent}>
                <div style={styles.hotelInfo}>
                  <img
                    src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop'}
                    alt={hotel.name}
                    style={styles.hotelImage}
                  />
                  <div style={styles.hotelDetails}>
                    <h4 style={styles.hotelName}>{hotel.name}</h4>
                    <div style={styles.location}>
                      <MapPin size={12} color="#6b7280" />
                      <span>{hotel.city || hotel.location}</span>
                    </div>
                    {hotel.rating > 0 && (
                      <div style={styles.rating}>
                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                        <span>{hotel.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.priceInfo}>
                  <div style={styles.priceRow}>
                    <div style={styles.priceLabel}>Target:</div>
                    <div style={styles.targetPrice}>${targetPrice}</div>
                  </div>
                  <div style={styles.priceRow}>
                    <div style={styles.priceLabel}>Current:</div>
                    <div style={{
                      ...styles.currentPriceAlert,
                      color: currentPrice <= targetPrice ? '#10b981' : '#6b7280'
                    }}>
                      ${currentPrice}
                    </div>
                  </div>

                  {currentPrice <= targetPrice ? (
                    <div style={styles.reachedBadge}>
                      <TrendingDown size={14} />
                      Price reached!
                    </div>
                  ) : (
                    <div style={styles.differenceText}>
                      ${difference} to go
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0fdf4',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  alert: {
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
  },
  alertTriggered: {
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
  },
  triggeredBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
    width: 'fit-content',
  },
  alertContent: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1.5rem',
    alignItems: 'center',
  },
  hotelInfo: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
  },
  hotelImage: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  hotelDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  hotelName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#92400e',
  },
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-end',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  priceLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  targetPrice: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  currentPriceAlert: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  reachedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#ecfdf5',
    color: '#047857',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  differenceText: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: '600',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .price-alert:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
    }
  `;
  document.head.appendChild(style);
}

export default PriceAlerts;
