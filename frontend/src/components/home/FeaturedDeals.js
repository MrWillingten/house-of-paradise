import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Star, Clock } from 'lucide-react';
import { featuredDeals } from '../../data/deals';

const FeaturedDeals = ({ darkMode }) => {
  const navigate = useNavigate();

  const getBadgeIcon = (icon) => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles size={16} />;
      case 'star':
        return <Star size={16} />;
      case 'zap':
        return <Zap size={16} />;
      default:
        return null;
    }
  };

  const getBadgeStyle = (color) => {
    const colors = {
      green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      orange: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    };
    return colors[color] || colors.green;
  };

  return (
    <section
      style={{
        ...styles.section,
        background: darkMode ? '#0a0a0a' : '#ffffff',
      }}
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <div className="scroll-reveal" style={styles.titleContainer}>
            <Zap size={32} color="#10b981" style={{ marginRight: '12px' }} />
            <h2
              style={{
                ...styles.title,
                color: darkMode ? '#ffffff' : '#1f2937',
              }}
            >
              Hot Deals This Week
            </h2>
          </div>
          <p
            className="scroll-reveal"
            style={{
              ...styles.subtitle,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            Limited time offers - Book now and save big!
          </p>
        </div>

        <div style={styles.grid}>
          {featuredDeals.map((deal) => (
            <div
              key={deal.id}
              className="scroll-reveal spotlight-card hover-lift"
              style={{
                ...styles.card,
                background: darkMode
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb',
              }}
            >
              <div style={{ ...styles.badge, background: getBadgeStyle(deal.badgeColor) }}>
                {getBadgeIcon(deal.badge.icon)}
                <span>{deal.badge.text}</span>
              </div>

              {deal.timer && (
                <div style={styles.timer}>
                  <Clock size={14} />
                  <span>{deal.timer}</span>
                </div>
              )}

              <img src={deal.image} alt={deal.title} style={styles.image} loading="lazy" />

              <div style={styles.content}>
                <h3
                  style={{
                    ...styles.cardTitle,
                    color: darkMode ? '#ffffff' : '#1f2937',
                  }}
                >
                  {deal.title}
                </h3>
                <p
                  style={{
                    ...styles.description,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}
                >
                  {deal.description}
                </p>

                <div style={styles.pricing}>
                  <div>
                    <span style={styles.oldPrice}>{deal.oldPrice}</span>
                    <span style={styles.newPrice}>{deal.newPrice}</span>
                  </div>
                  <div
                    style={{
                      ...styles.discount,
                      background: getBadgeStyle(deal.badgeColor),
                    }}
                  >
                    {deal.discount}
                  </div>
                </div>

                <button
                  className="clickable"
                  style={styles.button}
                  onClick={() => navigate('/hotels')}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '6rem 0',
    transition: 'background 1.2s ease',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '1.15rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
  },
  card: {
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
  },
  timer: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  content: {
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
  },
  pricing: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  oldPrice: {
    fontSize: '1rem',
    color: '#9ca3af',
    textDecoration: 'line-through',
    marginRight: '0.75rem',
  },
  newPrice: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#10b981',
  },
  discount: {
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
  },
};

export default FeaturedDeals;
