import React from 'react';
import { Star, TrendingUp, Award, ThumbsUp } from 'lucide-react';

const ReviewStats = ({ stats }) => {
  if (!stats || stats.totalReviews === 0) {
    return (
      <div style={styles.emptyState}>
        <Star size={48} color="#d1d5db" />
        <h3 style={styles.emptyTitle}>No reviews yet</h3>
        <p style={styles.emptyText}>Be the first to review this property!</p>
      </div>
    );
  }

  const { totalReviews, averageRating, ratingDistribution, categoryAverages } = stats;

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

  const ratingBreakdown = [
    { label: 'Excellent (9+)', count: ratingDistribution.excellent || 0, color: '#10b981' },
    { label: 'Very Good (8-9)', count: ratingDistribution.veryGood || 0, color: '#34d399' },
    { label: 'Good (7-8)', count: ratingDistribution.good || 0, color: '#fbbf24' },
    { label: 'Fair (6-7)', count: ratingDistribution.fair || 0, color: '#f59e0b' },
    { label: 'Poor (<6)', count: ratingDistribution.poor || 0, color: '#ef4444' },
  ];

  const categories = [
    { key: 'cleanliness', label: 'Cleanliness', icon: '✨' },
    { key: 'comfort', label: 'Comfort', icon: '🛏️' },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'facilities', label: 'Facilities', icon: '🏊' },
    { key: 'staff', label: 'Staff', icon: '👥' },
    { key: 'valueForMoney', label: 'Value for Money', icon: '💰' },
  ];

  return (
    <div style={styles.container}>
      {/* Overall Rating Card */}
      <div style={styles.overallCard}>
        <div style={styles.overallLeft}>
          <div style={styles.overallRatingBadge}>
            <span style={styles.overallRatingNumber}>{averageRating.toFixed(1)}</span>
            <div style={styles.overallRatingStars}>
              {[...Array(5)].map((_, i) => {
                const fillPercent = Math.min(Math.max((averageRating - i * 2) / 2, 0), 1) * 100;
                return (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <Star size={20} color="#d1d5db" />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${fillPercent}%`,
                      overflow: 'hidden'
                    }}>
                      <Star size={20} fill="#fbbf24" color="#fbbf24" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{
            ...styles.overallLabel,
            color: getRatingColor(averageRating)
          }}>
            {getRatingLabel(averageRating)}
          </div>
          <div style={styles.reviewCount}>
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution Bars */}
        <div style={styles.distributionBars}>
          {ratingBreakdown.map((item, index) => {
            const percentage = totalReviews > 0
              ? (item.count / totalReviews) * 100
              : 0;

            return (
              <div key={index} style={styles.distributionRow}>
                <span style={styles.distributionLabel}>{item.label}</span>
                <div style={styles.distributionBarContainer}>
                  <div
                    style={{
                      ...styles.distributionBarFill,
                      width: `${percentage}%`,
                      background: item.color
                    }}
                  />
                </div>
                <span style={styles.distributionCount}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Ratings */}
      <div style={styles.categoriesGrid}>
        {categories.map((category) => {
          const score = categoryAverages[category.key] || 0;
          if (score === 0) return null;

          return (
            <div key={category.key} style={styles.categoryCard}>
              <div style={styles.categoryIcon}>{category.icon}</div>
              <div style={styles.categoryInfo}>
                <div style={styles.categoryName}>{category.label}</div>
                <div style={styles.categoryRatingRow}>
                  <div style={{
                    ...styles.categoryScoreBadge,
                    background: getRatingColor(score)
                  }}>
                    {score.toFixed(1)}
                  </div>
                  <div style={styles.categoryStars}>
                    {[...Array(5)].map((_, i) => {
                      const fillPercent = Math.min(Math.max((score - i * 2) / 2, 0), 1) * 100;
                      return (
                        <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                          <Star size={14} color="#d1d5db" />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${fillPercent}%`,
                            overflow: 'hidden'
                          }}>
                            <Star size={14} fill={getRatingColor(score)} color={getRatingColor(score)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  emptyState: {
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
  overallCard: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '2rem',
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  overallLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '200px',
  },
  overallRatingBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  overallRatingNumber: {
    fontSize: '4rem',
    fontWeight: '900',
    color: '#10b981',
    lineHeight: 1,
  },
  overallRatingStars: {
    display: 'flex',
    gap: '0.25rem',
  },
  overallLabel: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginTop: '0.5rem',
  },
  reviewCount: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  distributionBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: 1,
  },
  distributionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  distributionLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4b5563',
    width: '130px',
    flexShrink: 0,
  },
  distributionBarContainer: {
    flex: 1,
    height: '12px',
    background: '#f3f4f6',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
  },
  distributionCount: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#1f2937',
    width: '40px',
    textAlign: 'right',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  categoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'white',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
    transition: 'all 0.3s',
  },
  categoryIcon: {
    fontSize: '2rem',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  categoryRatingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  categoryScoreBadge: {
    padding: '4px 10px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '800',
  },
  categoryStars: {
    display: 'flex',
    gap: '0.15rem',
  },
};

// Add hover effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .categoryCard:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
      border-color: #d1fae5;
    }
  `;
  document.head.appendChild(style);
}

export default ReviewStats;
