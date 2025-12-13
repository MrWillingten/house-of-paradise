import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, MapPin, Eye } from 'lucide-react';
import api from '../services/api';

const RecentlyViewed = ({ userId }) => {
  const [recentHotels, setRecentHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchRecentlyViewed();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchRecentlyViewed = async () => {
    try {
      const response = await api.get(
        `/api/personalization/recently-viewed/${userId}?limit=6`
      );
      setRecentHotels(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      setRecentHotels([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recentHotels.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Clock size={28} color="#10b981" />
        <div>
          <h2 style={styles.title}>Recently Viewed</h2>
          <p style={styles.subtitle}>Continue exploring these properties</p>
        </div>
      </div>

      <div style={styles.grid}>
        {recentHotels.map((hotel) => (
          <div
            key={hotel._id}
            style={styles.card}
            className="recently-viewed-card"
            onClick={() => navigate(`/hotel/${hotel._id}`)}
          >
            <div style={styles.imageContainer}>
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop'}
                alt={hotel.name}
                style={styles.image}
                loading="lazy"
              />
              <div style={styles.recentBadge}>
                <Eye size={12} />
                Recent
              </div>
            </div>

            <div style={styles.content}>
              <h3 style={styles.hotelName}>{hotel.name}</h3>

              <div style={styles.location}>
                <MapPin size={12} color="#6b7280" />
                <span>{hotel.city || hotel.location}</span>
              </div>

              <div style={styles.footer}>
                {hotel.rating > 0 && (
                  <div style={styles.rating}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    <span>{hotel.rating.toFixed(1)}</span>
                  </div>
                )}
                <div style={styles.price}>
                  ${hotel.pricePerNight}
                  <span style={styles.perNight}>/night</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '3rem 2rem',
    background: '#f9fafb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '2px solid transparent',
  },
  imageContainer: {
    position: 'relative',
    height: '150px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  recentBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: 'rgba(16, 185, 129, 0.9)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backdropFilter: 'blur(10px)',
  },
  content: {
    padding: '1rem',
  },
  hotelName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#92400e',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#10b981',
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  perNight: {
    fontSize: '0.7rem',
    fontWeight: '500',
    color: '#6b7280',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .recently-viewed-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      border-color: #10b981;
    }

    .recently-viewed-card:hover img {
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(style);
}

export default RecentlyViewed;
