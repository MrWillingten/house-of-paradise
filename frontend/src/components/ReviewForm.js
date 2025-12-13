import React, { useState } from 'react';
import {
  Star, Upload, X, Plus, Minus, User, Users, Heart,
  Briefcase, CheckCircle, AlertCircle
} from 'lucide-react';

const ReviewForm = ({ hotelId, userId, bookingId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    categoryRatings: {
      cleanliness: 0,
      comfort: 0,
      location: 0,
      facilities: 0,
      staff: 0,
      valueForMoney: 0,
    },
    title: '',
    reviewText: '',
    pros: [],
    cons: [],
    travelType: 'solo',
    photos: [],
  });

  const [currentPro, setCurrentPro] = useState('');
  const [currentCon, setCurrentCon] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (formData.overallRating === 0) {
      newErrors.overallRating = 'Please select an overall rating';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.reviewText.length < 50) {
      newErrors.reviewText = 'Review must be at least 50 characters';
    }
    if (formData.reviewText.length > 2000) {
      newErrors.reviewText = 'Review must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        userId,
        bookingId,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, overallRating: rating });
  };

  const handleCategoryRating = (category, rating) => {
    setFormData({
      ...formData,
      categoryRatings: {
        ...formData.categoryRatings,
        [category]: rating,
      },
    });
  };

  const addPro = () => {
    if (currentPro.trim() && formData.pros.length < 5) {
      setFormData({
        ...formData,
        pros: [...formData.pros, currentPro.trim()],
      });
      setCurrentPro('');
    }
  };

  const removePro = (index) => {
    setFormData({
      ...formData,
      pros: formData.pros.filter((_, i) => i !== index),
    });
  };

  const addCon = () => {
    if (currentCon.trim() && formData.cons.length < 5) {
      setFormData({
        ...formData,
        cons: [...formData.cons, currentCon.trim()],
      });
      setCurrentCon('');
    }
  };

  const removeCon = (index) => {
    setFormData({
      ...formData,
      cons: formData.cons.filter((_, i) => i !== index),
    });
  };

  const travelTypes = [
    { value: 'solo', label: 'Solo', icon: <User size={18} /> },
    { value: 'couple', label: 'Couple', icon: <Heart size={18} /> },
    { value: 'family', label: 'Family', icon: <Users size={18} /> },
    { value: 'business', label: 'Business', icon: <Briefcase size={18} /> },
    { value: 'friends', label: 'Friends', icon: <Users size={18} /> },
  ];

  const categories = [
    { key: 'cleanliness', label: 'Cleanliness', icon: '✨' },
    { key: 'comfort', label: 'Comfort', icon: '🛏️' },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'facilities', label: 'Facilities', icon: '🏊' },
    { key: 'staff', label: 'Staff', icon: '👥' },
    { key: 'valueForMoney', label: 'Value for Money', icon: '💰' },
  ];

  const RatingSelector = ({ value, onChange, size = 'large' }) => {
    const starSize = size === 'large' ? 40 : 24;
    const maxRating = 10;

    return (
      <div style={styles.ratingSelector}>
        {[...Array(maxRating)].map((_, index) => {
          const ratingValue = index + 1;
          const isActive = ratingValue <= value;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(ratingValue)}
              style={{
                ...styles.starButton,
                width: starSize,
                height: starSize,
              }}
              className="star-btn"
            >
              <Star
                size={starSize - 8}
                fill={isActive ? '#fbbf24' : 'transparent'}
                color={isActive ? '#fbbf24' : '#d1d5db'}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>Write a Review</h2>
        <p style={styles.formSubtitle}>Share your experience with other travelers</p>
      </div>

      {/* Overall Rating */}
      <div style={styles.section}>
        <label style={styles.label}>
          Overall Rating <span style={styles.required}>*</span>
        </label>
        <RatingSelector
          value={formData.overallRating}
          onChange={handleRatingClick}
          size="large"
        />
        {formData.overallRating > 0 && (
          <div style={styles.ratingLabel}>
            {formData.overallRating}/10 - {getRatingLabel(formData.overallRating)}
          </div>
        )}
        {errors.overallRating && (
          <div style={styles.error}>{errors.overallRating}</div>
        )}
      </div>

      {/* Category Ratings */}
      <div style={styles.section}>
        <label style={styles.label}>Rate Your Experience (Optional)</label>
        <div style={styles.categoryGrid}>
          {categories.map((category) => (
            <div key={category.key} style={styles.categoryRatingItem}>
              <div style={styles.categoryHeader}>
                <span style={styles.categoryEmoji}>{category.icon}</span>
                <span style={styles.categoryLabel}>{category.label}</span>
              </div>
              <RatingSelector
                value={formData.categoryRatings[category.key]}
                onChange={(rating) => handleCategoryRating(category.key, rating)}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Travel Type */}
      <div style={styles.section}>
        <label style={styles.label}>
          Travel Type <span style={styles.required}>*</span>
        </label>
        <div style={styles.travelTypeGrid}>
          {travelTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, travelType: type.value })}
              style={
                formData.travelType === type.value
                  ? styles.travelTypeButtonActive
                  : styles.travelTypeButton
              }
              className="travel-type-btn"
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Review Title */}
      <div style={styles.section}>
        <label style={styles.label}>
          Review Title <span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summarize your experience..."
          style={styles.input}
          maxLength={100}
        />
        <div style={styles.charCount}>{formData.title.length}/100</div>
        {errors.title && <div style={styles.error}>{errors.title}</div>}
      </div>

      {/* Review Text */}
      <div style={styles.section}>
        <label style={styles.label}>
          Your Review <span style={styles.required}>*</span>
        </label>
        <textarea
          value={formData.reviewText}
          onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
          placeholder="Tell us about your stay... (minimum 50 characters)"
          style={styles.textarea}
          rows={6}
          maxLength={2000}
        />
        <div style={styles.charCount}>
          {formData.reviewText.length}/2000 (min 50)
        </div>
        {errors.reviewText && <div style={styles.error}>{errors.reviewText}</div>}
      </div>

      {/* Pros */}
      <div style={styles.section}>
        <label style={styles.label}>What did you like? (Optional)</label>
        <div style={styles.listInputContainer}>
          <input
            type="text"
            value={currentPro}
            onChange={(e) => setCurrentPro(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
            placeholder="Add a positive point..."
            style={styles.input}
            maxLength={100}
          />
          <button
            type="button"
            onClick={addPro}
            style={styles.addButton}
            disabled={formData.pros.length >= 5}
            className="add-btn"
          >
            <Plus size={18} />
          </button>
        </div>
        {formData.pros.length > 0 && (
          <div style={styles.chipContainer}>
            {formData.pros.map((pro, index) => (
              <div key={index} style={styles.proChip}>
                <span>{pro}</span>
                <button
                  type="button"
                  onClick={() => removePro(index)}
                  style={styles.chipRemove}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cons */}
      <div style={styles.section}>
        <label style={styles.label}>What could be improved? (Optional)</label>
        <div style={styles.listInputContainer}>
          <input
            type="text"
            value={currentCon}
            onChange={(e) => setCurrentCon(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
            placeholder="Add a point for improvement..."
            style={styles.input}
            maxLength={100}
          />
          <button
            type="button"
            onClick={addCon}
            style={styles.addButton}
            disabled={formData.cons.length >= 5}
            className="add-btn"
          >
            <Plus size={18} />
          </button>
        </div>
        {formData.cons.length > 0 && (
          <div style={styles.chipContainer}>
            {formData.cons.map((con, index) => (
              <div key={index} style={styles.conChip}>
                <span>{con}</span>
                <button
                  type="button"
                  onClick={() => removeCon(index)}
                  style={styles.chipRemove}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div style={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
          disabled={submitting}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button
          type="submit"
          style={styles.submitButton}
          disabled={submitting}
          className="submit-btn"
        >
          {submitting ? (
            <>
              <div className="spinner-small" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Submit Review
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  formHeader: {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0fdf4',
  },
  formTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  formSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  section: {
    marginBottom: '2rem',
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.75rem',
  },
  required: {
    color: '#ef4444',
  },
  ratingSelector: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  starButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    transition: 'transform 0.2s',
  },
  ratingLabel: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#10b981',
    marginTop: '0.75rem',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  categoryRatingItem: {
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '12px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  categoryEmoji: {
    fontSize: '1.25rem',
  },
  categoryLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
  },
  travelTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.75rem',
  },
  travelTypeButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4b5563',
  },
  travelTypeButtonActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#047857',
    transform: 'scale(1.05)',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  charCount: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '0.5rem',
    textAlign: 'right',
  },
  listInputContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  addButton: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  proChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#f0fdf4',
    color: '#047857',
    padding: '0.5rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid #d1fae5',
  },
  conChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#fef2f2',
    color: '#dc2626',
    padding: '0.5rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid #fecaca',
  },
  chipRemove: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ef4444',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px solid #f3f4f6',
  },
  cancelButton: {
    padding: '0.75rem 2rem',
    background: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
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
};

const getRatingLabel = (rating) => {
  if (rating >= 9) return 'Excellent';
  if (rating >= 8) return 'Very Good';
  if (rating >= 7) return 'Good';
  if (rating >= 6) return 'Fair';
  return 'Poor';
};

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .star-btn:hover {
      transform: scale(1.2);
    }

    .travel-type-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
    }

    input:focus, textarea:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .add-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    .add-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .cancel-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-2px);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner-small {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default ReviewForm;
