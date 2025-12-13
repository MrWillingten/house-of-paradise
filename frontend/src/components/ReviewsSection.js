import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import ReviewStats from './ReviewStats';
import ReviewForm from './ReviewForm';
import { Star, Filter, Plus, ChevronDown } from 'lucide-react';
import axios from 'axios';

const ReviewsSection = ({ hotelId, currentUserId, hasBooking }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Filters
  const [sortBy, setSortBy] = useState('recent');
  const [filterByTravelType, setFilterByTravelType] = useState('');
  const [filterByRating, setFilterByRating] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [hotelId, sortBy, filterByTravelType, filterByRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { sort: sortBy };
      if (filterByTravelType) params.travelType = filterByTravelType;
      if (filterByRating) params.minRating = filterByRating;

      const response = await axios.get(`http://localhost:3001/api/hotels/${hotelId}/reviews`, { params });

      setReviews(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/hotels/${hotelId}/reviews`,
        reviewData
      );

      // Add new review to list
      setReviews([response.data.data, ...reviews]);

      // Refresh stats
      fetchReviews();

      // Close form
      setShowReviewForm(false);

      alert('Review submitted successfully! ✅');
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const handleVote = async (reviewId, helpful) => {
    try {
      await axios.post(`http://localhost:3001/api/reviews/${reviewId}/vote`, {
        userId: currentUserId,
        helpful,
      });

      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error('Error voting:', error);
      alert(error.response?.data?.error || 'Failed to vote');
    }
  };

  return (
    <div style={styles.container}>
      {/* Section Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <Star size={32} color="#10b981" />
            Guest Reviews
          </h2>
          <p style={styles.subtitle}>
            Real reviews from real guests
          </p>
        </div>

        {hasBooking && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            style={styles.writeReviewButton}
            className="write-review-btn"
          >
            <Plus size={20} />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div style={styles.formContainer}>
          <ReviewForm
            hotelId={hotelId}
            userId={currentUserId}
            bookingId={hasBooking}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Review Statistics */}
      <ReviewStats stats={stats} />

      {/* Filters & Sort */}
      {reviews.length > 0 && (
        <div style={styles.controls}>
          <div style={styles.controlsLeft}>
            <h3 style={styles.reviewsListTitle}>
              All Reviews ({stats?.totalReviews || 0})
            </h3>
          </div>

          <div style={styles.controlsRight}>
            {/* Travel Type Filter */}
            <select
              value={filterByTravelType}
              onChange={(e) => setFilterByTravelType(e.target.value)}
              style={styles.select}
              className="filter-select"
            >
              <option value="">All Travelers</option>
              <option value="solo">Solo Travelers</option>
              <option value="couple">Couples</option>
              <option value="family">Families</option>
              <option value="business">Business</option>
              <option value="friends">Friends</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filterByRating}
              onChange={(e) => setFilterByRating(e.target.value)}
              style={styles.select}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="9">Excellent (9+)</option>
              <option value="8">Very Good (8+)</option>
              <option value="7">Good (7+)</option>
              <option value="6">Fair (6+)</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
              className="filter-select"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={styles.loading}>
          <div className="spinner" style={styles.spinner} />
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div style={styles.emptyReviews}>
          <Star size={48} color="#d1d5db" />
          <h3 style={styles.emptyTitle}>No reviews found</h3>
          <p style={styles.emptyText}>
            {filterByTravelType || filterByRating
              ? 'Try adjusting your filters'
              : 'Be the first to review this property!'}
          </p>
        </div>
      ) : (
        <div style={styles.reviewsList}>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6b7280',
  },
  writeReviewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  formContainer: {
    marginBottom: '2rem',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '2px solid #f3f4f6',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  controlsLeft: {
    flex: 1,
  },
  controlsRight: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  reviewsListTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  select: {
    padding: '0.75rem 1rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1f2937',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6b7280',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTopColor: '#10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },
  emptyReviews: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6b7280',
  },
};

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .write-review-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .filter-select:hover {
      border-color: #10b981;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
    }

    .filter-select:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
  `;
  document.head.appendChild(style);
}

export default ReviewsSection;
