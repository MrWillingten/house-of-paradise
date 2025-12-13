import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, TrendingDown, Bell, Star, MapPin, Trash2 } from 'lucide-react';
import api from '../services/api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    } else {
      navigate('/login');
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get(
        `/api/personalization/wishlist/${userId}`
      );
      setWishlist(response.data.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (hotelId, e) => {
    e.stopPropagation();

    try {
      await api.delete('/api/personalization/wishlist/remove', {
        data: { userId, hotelId }
      });

      setWishlist(wishlist.filter(item => item.hotel._id !== hotelId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleSetPriceAlert = async (hotelId, currentPrice, e) => {
    e.stopPropagation();

    const targetPrice = prompt(
      `Set a price alert for this hotel.\nCurrent price: $${currentPrice}\n\nEnter your target price:`,
      Math.round(currentPrice * 0.9)
    );

    if (targetPrice && !isNaN(targetPrice)) {
      try {
        await api.post('/api/personalization/price-alert', {
          userId,
          hotelId,
          targetPrice: Number(targetPrice)
        });

        alert(`✅ Price alert set! We'll notify you when the price drops to $${targetPrice} or below.`);
      } catch (error) {
        console.error('Error setting price alert:', error);
        alert('Failed to set price alert');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner" style={styles.spinner} />
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}>
            <Heart size={40} color="#10b981" fill="#10b981" />
          </div>
          <div>
            <h1 style={styles.title}>My Wishlist</h1>
            <p style={styles.subtitle}>
              {wishlist.length === 0
                ? 'No saved hotels yet'
                : `${wishlist.length} ${wishlist.length === 1 ? 'property' : 'properties'} saved`}
            </p>
          </div>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div style={styles.empty}>
          <Heart size={64} color="#d1d5db" />
          <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
          <p style={styles.emptyText}>
            Start saving your favorite hotels to keep track of them!
          </p>
          <button
            onClick={() => navigate('/hotels')}
            style={styles.browseButton}
            className="browse-btn"
          >
            Browse Hotels
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {wishlist.map(({ hotel, addedAt, priceWhenAdded, currentPrice, priceDrop }) => (
            <div
              key={hotel._id}
              style={styles.card}
              className="wishlist-card"
              onClick={() => navigate(`/hotel/${hotel._id}`)}
            >
              {/* Price Drop Badge */}
              {priceDrop > 0 && (
                <div style={styles.priceDropBanner}>
                  <TrendingDown size={16} />
                  <span>Price dropped ${priceDrop}!</span>
                </div>
              )}

              <div style={styles.imageContainer}>
                <img
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                  alt={hotel.name}
                  style={styles.image}
                  loading="lazy"
                />

                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemove(hotel._id, e)}
                  style={styles.removeButton}
                  className="remove-btn"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={styles.content}>
                <h3 style={styles.hotelName}>{hotel.name}</h3>

                <div style={styles.location}>
                  <MapPin size={14} color="#6b7280" />
                  <span>{hotel.city || hotel.location}</span>
                </div>

                {hotel.rating > 0 && (
                  <div style={styles.rating}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>{hotel.rating.toFixed(1)}</span>
                    {hotel.reviewCount > 0 && (
                      <span style={styles.reviewCount}>({hotel.reviewCount})</span>
                    )}
                  </div>
                )}

                {/* Price Comparison */}
                <div style={styles.priceSection}>
                  <div style={styles.priceComparison}>
                    <div style={styles.priceLabel}>When saved:</div>
                    <div style={styles.savedPrice}>${priceWhenAdded}</div>
                  </div>
                  <div style={styles.priceComparison}>
                    <div style={styles.priceLabel}>Current:</div>
                    <div style={{
                      ...styles.currentPrice,
                      color: priceDrop > 0 ? '#10b981' : '#1f2937'
                    }}>
                      ${currentPrice}
                    </div>
                  </div>
                </div>

                {/* Price Alert Button */}
                <button
                  onClick={(e) => handleSetPriceAlert(hotel._id, currentPrice, e)}
                  style={styles.alertButton}
                  className="alert-btn"
                >
                  <Bell size={16} />
                  Set Price Alert
                </button>

                {/* Added Date */}
                <div style={styles.addedDate}>
                  Saved {new Date(addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  header: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '3rem 2rem',
    color: 'white',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  headerIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.95,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    gap: '1rem',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTopColor: '#10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  empty: {
    maxWidth: '600px',
    margin: '4rem auto',
    padding: '4rem 2rem',
    textAlign: 'center',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  emptyTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  browseButton: {
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
  grid: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '3rem 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    border: '2px solid transparent',
  },
  priceDropBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    zIndex: 10,
  },
  imageContainer: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
    marginTop: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  removeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '36px',
    height: '36px',
    background: 'rgba(239, 68, 68, 0.95)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
    zIndex: 5,
  },
  content: {
    padding: '1.25rem',
  },
  hotelName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  reviewCount: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  priceSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  priceComparison: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  priceLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  savedPrice: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#9ca3af',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  alertButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem',
    background: '#fffbeb',
    color: '#92400e',
    border: '2px solid #fde68a',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '0.75rem',
  },
  addedDate: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'center',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .wishlist-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
      border-color: #10b981;
    }

    .wishlist-card:hover img {
      transform: scale(1.1);
    }

    .remove-btn:hover {
      transform: scale(1.15) rotate(90deg);
      background: #dc2626;
    }

    .alert-btn:hover {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #78350f;
      transform: translateY(-2px);
    }

    .browse-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }
  `;
  document.head.appendChild(style);
}

export default Wishlist;
