import React, { useState } from 'react';
import {
  Star, ThumbsUp, ThumbsDown, User, Calendar, CheckCircle,
  MapPin, Users, Briefcase, Heart, Flag, MessageCircle
} from 'lucide-react';

const ReviewCard = ({ review, onVote, currentUserId }) => {
  const [showFullText, setShowFullText] = useState(false);
  const [votedHelpful, setVotedHelpful] = useState(
    review.helpfulVotes?.includes(currentUserId)
  );

  const getTravelTypeIcon = (type) => {
    switch (type) {
      case 'solo':
        return <User size={14} />;
      case 'couple':
        return <Heart size={14} />;
      case 'family':
        return <Users size={14} />;
      case 'business':
        return <Briefcase size={14} />;
      case 'friends':
        return <Users size={14} />;
      default:
        return null;
    }
  };

  const getTravelTypeLabel = (type) => {
    const labels = {
      solo: 'Solo Traveler',
      couple: 'Couple',
      family: 'Family',
      business: 'Business',
      friends: 'Friends'
    };
    return labels[type] || type;
  };

  const getRatingLabel = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 8) return 'Very Good';
    if (rating >= 7) return 'Good';
    if (rating >= 6) return 'Fair';
    return 'Poor';
  };

  const getRatingColor = (rating) => {
    if (rating >= 9) return '#10b981';
    if (rating >= 8) return '#34d399';
    if (rating >= 7) return '#fbbf24';
    if (rating >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getMonthYear = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleVote = (helpful) => {
    if (!votedHelpful && onVote) {
      onVote(review._id, helpful);
      setVotedHelpful(true);
    }
  };

  const reviewText = review.reviewText || '';
  const shouldTruncate = reviewText.length > 300;
  const displayText = shouldTruncate && !showFullText
    ? reviewText.substring(0, 300) + '...'
    : reviewText;

  return (
    <div style={styles.card} className="review-card">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            <User size={24} color="#10b981" />
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>
              Anonymous Traveler
              {review.verified && (
                <div style={styles.verifiedBadge}>
                  <CheckCircle size={14} />
                  <span>Verified Stay</span>
                </div>
              )}
            </div>
            <div style={styles.metaInfo}>
              <span style={styles.metaItem}>
                <Calendar size={12} />
                {getMonthYear(review.createdAt)}
              </span>
              <span style={styles.metaDivider}>•</span>
              <span style={styles.metaItem}>
                {getTravelTypeIcon(review.travelType)}
                {getTravelTypeLabel(review.travelType)}
              </span>
              {review.stayDuration && (
                <>
                  <span style={styles.metaDivider}>•</span>
                  <span style={styles.metaItem}>
                    {review.stayDuration} {review.stayDuration === 1 ? 'night' : 'nights'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overall Rating Badge */}
        <div style={{
          ...styles.ratingBadge,
          background: getRatingColor(review.overallRating)
        }}>
          <Star size={18} fill="white" color="white" />
          <span style={styles.ratingNumber}>{review.overallRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Review Title */}
      <h3 style={styles.title}>{review.title}</h3>

      {/* Category Ratings */}
      {review.categoryRatings && Object.keys(review.categoryRatings).length > 0 && (
        <div style={styles.categoryRatings}>
          {Object.entries(review.categoryRatings).map(([category, rating]) => {
            if (!rating) return null;
            return (
              <div key={category} style={styles.categoryItem}>
                <span style={styles.categoryLabel}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
                <div style={styles.categoryBar}>
                  <div style={{
                    ...styles.categoryBarFill,
                    width: `${(rating / 10) * 100}%`,
                    background: `linear-gradient(90deg, ${getRatingColor(rating)} 0%, ${getRatingColor(rating)}dd 100%)`
                  }} />
                  <span style={styles.categoryScore}>{rating.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pros & Cons */}
      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div style={styles.prosConsContainer}>
          {review.pros?.length > 0 && (
            <div style={styles.prosSection}>
              <div style={styles.prosHeader}>
                <ThumbsUp size={14} color="#10b981" />
                <span style={styles.prosTitle}>Pros</span>
              </div>
              <ul style={styles.prosList}>
                {review.pros.map((pro, index) => (
                  <li key={index} style={styles.prosItem}>{pro}</li>
                ))}
              </ul>
            </div>
          )}
          {review.cons?.length > 0 && (
            <div style={styles.consSection}>
              <div style={styles.consHeader}>
                <ThumbsDown size={14} color="#ef4444" />
                <span style={styles.consTitle}>Cons</span>
              </div>
              <ul style={styles.consList}>
                {review.cons.map((con, index) => (
                  <li key={index} style={styles.consItem}>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Review Text */}
      <p style={styles.reviewText}>
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          style={styles.readMoreButton}
          onClick={() => setShowFullText(!showFullText)}
          className="read-more-btn"
        >
          {showFullText ? 'Show Less' : 'Read More'}
        </button>
      )}

      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <div style={styles.photoGallery}>
          {review.photos.slice(0, 4).map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Review photo ${index + 1}`}
              style={styles.photo}
              loading="lazy"
            />
          ))}
          {review.photos.length > 4 && (
            <div style={styles.photoMore}>
              +{review.photos.length - 4} more
            </div>
          )}
        </div>
      )}

      {/* Management Response */}
      {review.managementResponse && (
        <div style={styles.managementResponse}>
          <div style={styles.responseHeader}>
            <MessageCircle size={16} color="#10b981" />
            <span style={styles.responseTitle}>Response from Management</span>
          </div>
          <p style={styles.responseText}>{review.managementResponse.text}</p>
          <div style={styles.responseDate}>
            {getMonthYear(review.managementResponse.respondedAt)}
          </div>
        </div>
      )}

      {/* Footer - Helpful Votes */}
      <div style={styles.footer}>
        <div style={styles.helpfulSection}>
          <span style={styles.helpfulLabel}>Was this review helpful?</span>
          <div style={styles.voteButtons}>
            <button
              style={votedHelpful ? styles.voteButtonDisabled : styles.voteButton}
              onClick={() => handleVote(true)}
              disabled={votedHelpful}
              className="vote-btn"
            >
              <ThumbsUp size={16} />
              <span>Yes ({review.helpfulCount || 0})</span>
            </button>
            <button
              style={votedHelpful ? styles.voteButtonDisabled : styles.voteButton}
              onClick={() => handleVote(false)}
              disabled={votedHelpful}
              className="vote-btn"
            >
              <ThumbsDown size={16} />
              <span>No ({review.notHelpfulCount || 0})</span>
            </button>
          </div>
        </div>

        <button style={styles.reportButton} className="report-btn">
          <Flag size={14} />
          Report
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    border: '1px solid #f3f4f6',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  userInfo: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  userName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  verifiedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: '#ecfdf5',
    color: '#047857',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#6b7280',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  metaDivider: {
    color: '#d1d5db',
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  ratingNumber: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  categoryRatings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  categoryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  categoryLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  categoryBar: {
    position: 'relative',
    height: '24px',
    background: '#e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.5s ease',
  },
  categoryScore: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  prosConsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  prosSection: {
    background: '#f0fdf4',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #d1fae5',
  },
  prosHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  prosTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#047857',
  },
  prosList: {
    margin: 0,
    paddingLeft: '1.25rem',
  },
  prosItem: {
    color: '#065f46',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
    lineHeight: '1.5',
  },
  consSection: {
    background: '#fef2f2',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #fecaca',
  },
  consHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  consTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#dc2626',
  },
  consList: {
    margin: 0,
    paddingLeft: '1.25rem',
  },
  consItem: {
    color: '#991b1b',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
    lineHeight: '1.5',
  },
  reviewText: {
    fontSize: '0.95rem',
    lineHeight: '1.7',
    color: '#374151',
    marginBottom: '1rem',
    whiteSpace: 'pre-wrap',
  },
  readMoreButton: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '0.5rem 0',
    marginBottom: '1rem',
  },
  photoGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  photo: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  photoMore: {
    width: '100%',
    height: '100px',
    background: '#f3f4f6',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#6b7280',
  },
  managementResponse: {
    background: '#fffbeb',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #fde68a',
    marginBottom: '1rem',
  },
  responseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  responseTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#92400e',
  },
  responseText: {
    fontSize: '0.9rem',
    color: '#78350f',
    lineHeight: '1.6',
    marginBottom: '0.5rem',
  },
  responseDate: {
    fontSize: '0.75rem',
    color: '#a16207',
    fontWeight: '500',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  helpfulSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
  },
  helpfulLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#6b7280',
  },
  voteButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  voteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  voteButtonDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  reportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .review-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      border-color: #e5e7eb;
    }

    .vote-btn:not(:disabled):hover {
      background: #f0fdf4;
      border-color: #10b981;
      color: #047857;
      transform: translateY(-2px);
    }

    .report-btn:hover {
      background: #fef2f2;
      border-color: #ef4444;
      color: #dc2626;
    }

    .read-more-btn:hover {
      text-decoration: underline;
    }

    .photo:hover {
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);
}

export default ReviewCard;
