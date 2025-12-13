import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, Star, MapPin, Heart } from 'lucide-react';
import api from '../services/api';

const RecommendedForYou = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(
        `/api/personalization/recommendations/${userId}?limit=8`
      );
      setRecommendations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < recommendations.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={styles.spinner} />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const visibleHotels = recommendations.slice(currentIndex, currentIndex + 3);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Sparkles size={28} color="#10b981" />
          <div>
            <h2 style={styles.title}>Recommended For You</h2>
            <p style={styles.subtitle}>Based on your searches and preferences</p>
          </div>
        </div>
        <div style={styles.navigation}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={currentIndex === 0 ? styles.navButtonDisabled : styles.navButton}
            className="nav-btn"
          >
            <ChevronLeft size={20} />
          </button>
          <span style={styles.navIndicator}>
            {currentIndex + 1}-{Math.min(currentIndex + 3, recommendations.length)} of {recommendations.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex >= recommendations.length - 3}
            style={currentIndex >= recommendations.length - 3 ? styles.navButtonDisabled : styles.navButton}
            className="nav-btn"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={styles.carousel}>
        <div style={{
          ...styles.carouselTrack,
          transform: `translateX(-${currentIndex * 33.33}%)`
        }}>
          {recommendations.map((hotel) => (
            <div
              key={hotel._id}
              style={styles.hotelCard}
              className="recommendation-card"
              onClick={() => navigate(`/hotel/${hotel._id}`)}
            >
              <div style={styles.imageContainer}>
                <img
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                  alt={hotel.name}
                  style={styles.image}
                  loading="lazy"
                />
                {hotel.discountPercent > 0 && (
                  <div style={styles.discountBadge}>
                    {hotel.discountPercent}% OFF
                  </div>
                )}
                {hotel.isPopular && (
                  <div style={styles.hotBadge}>
                    🔥 Hot Deal
                  </div>
                )}
              </div>

              <div style={styles.content}>
                <h3 style={styles.hotelName}>{hotel.name}</h3>

                <div style={styles.location}>
                  <MapPin size={14} color="#6b7280" />
                  <span>{hotel.city || hotel.location}</span>
                </div>

                {hotel.rating > 0 && (
                  <div style={styles.ratingRow}>
                    <div style={styles.ratingBadge}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span>{hotel.rating.toFixed(1)}</span>
                    </div>
                    {hotel.reviewCount > 0 && (
                      <span style={styles.reviewCount}>
                        ({hotel.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                <div style={styles.priceRow}>
                  {hotel.originalPrice && (
                    <span style={styles.originalPrice}>${hotel.originalPrice}</span>
                  )}
                  <div style={styles.currentPrice}>
                    ${hotel.pricePerNight}
                    <span style={styles.perNight}>/night</span>
                  </div>
                </div>

                {hotel.originalPrice && hotel.originalPrice > hotel.pricePerNight && (
                  <div style={styles.savings}>
                    Save ${hotel.originalPrice - hotel.pricePerNight}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.viewAllContainer}>
        <button
          onClick={() => navigate('/hotels')}
          style={styles.viewAllButton}
          className="view-all-btn"
        >
          View All Hotels
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '3rem 0',
    background: 'white',
  },
  loadingContainer: {
    padding: '4rem',
    textAlign: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTopColor: '#10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '0 2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navButton: {
    width: '40px',
    height: '40px',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '50%',
    color: '#10b981',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  navButtonDisabled: {
    width: '40px',
    height: '40px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '50%',
    color: '#d1d5db',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  navIndicator: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#6b7280',
  },
  carousel: {
    overflow: 'hidden',
    padding: '0 2rem',
  },
  carouselTrack: {
    display: 'flex',
    transition: 'transform 0.5s ease',
    gap: '1.5rem',
  },
  hotelCard: {
    minWidth: 'calc(33.33% - 1rem)',
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  imageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  discountBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
  },
  hotBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
  },
  content: {
    padding: '1.25rem',
  },
  hotelName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: '#fffbeb',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#92400e',
  },
  reviewCount: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  originalPrice: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#10b981',
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  perNight: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#6b7280',
  },
  savings: {
    fontSize: '0.75rem',
    color: '#047857',
    fontWeight: '600',
    background: '#ecfdf5',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  viewAllContainer: {
    textAlign: 'center',
    marginTop: '2rem',
    padding: '0 2rem',
  },
  viewAllButton: {
    padding: '0.75rem 2rem',
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
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .recommendation-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
      border-color: #10b981;
    }

    .recommendation-card:hover img {
      transform: scale(1.1);
    }

    .nav-btn:not(:disabled):hover {
      background: #10b981;
      color: white;
      transform: scale(1.1);
    }

    .view-all-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    @media (max-width: 1024px) {
      .hotelCard {
        min-width: calc(50% - 0.75rem) !important;
      }
    }

    @media (max-width: 640px) {
      .hotelCard {
        min-width: 100% !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default RecommendedForYou;
