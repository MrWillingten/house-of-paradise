import React, { useState } from 'react';
import {
  Filter, X, ChevronDown, ChevronUp, DollarSign, Star,
  Home, Building, Castle, Waves, Coffee, Wifi,
  UtensilsCrossed, Dumbbell, Car, Wind, Tv, Shield
} from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange, onClearAll, resultCount, darkMode }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    propertyType: true,
    rating: true,
    amenities: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (type, value) => {
    onFilterChange({
      ...filters,
      [type]: value === '' ? '' : Number(value)
    });
  };

  const handlePropertyTypeToggle = (type) => {
    const current = filters.propertyTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];

    onFilterChange({
      ...filters,
      propertyTypes: updated
    });
  };

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];

    onFilterChange({
      ...filters,
      amenities: updated
    });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === rating ? '' : rating
    });
  };

  const propertyTypes = [
    { id: 'hotel', label: 'Hotels', icon: <Building size={20} /> },
    { id: 'apartment', label: 'Apartments', icon: <Home size={20} /> },
    { id: 'villa', label: 'Villas', icon: <Castle size={20} /> },
    { id: 'resort', label: 'Resorts', icon: <Waves size={20} /> },
    { id: 'boutique', label: 'Boutique', icon: <Coffee size={20} /> },
  ];

  const amenitiesList = [
    { id: 'WiFi', label: 'Free WiFi', icon: <Wifi size={18} /> },
    { id: 'Pool', label: 'Swimming Pool', icon: <Waves size={18} /> },
    { id: 'Restaurant', label: 'Restaurant', icon: <UtensilsCrossed size={18} /> },
    { id: 'Gym', label: 'Fitness Center', icon: <Dumbbell size={18} /> },
    { id: 'Parking', label: 'Free Parking', icon: <Car size={18} /> },
    { id: 'AC', label: 'Air Conditioning', icon: <Wind size={18} /> },
    { id: 'TV', label: 'Flat Screen TV', icon: <Tv size={18} /> },
    { id: 'Safe', label: 'Room Safe', icon: <Shield size={18} /> },
  ];

  const ratings = [9, 8, 7, 6];

  const activeFilterCount = () => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.propertyTypes?.length > 0) count += filters.propertyTypes.length;
    if (filters.amenities?.length > 0) count += filters.amenities.length;
    if (filters.minRating) count++;
    return count;
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div style={darkMode ? stylesDark.filterSection : styles.filterSection}>
      <div
        style={darkMode ? stylesDark.sectionHeader : styles.sectionHeader}
        onClick={onToggle}
        className="filter-section-header"
      >
        <h3 style={darkMode ? stylesDark.sectionTitle : styles.sectionTitle}>{title}</h3>
        {isExpanded ? <ChevronUp size={20} color={darkMode ? '#9ca3af' : '#1f2937'} /> : <ChevronDown size={20} color={darkMode ? '#9ca3af' : '#1f2937'} />}
      </div>
      {isExpanded && (
        <div style={styles.sectionContent}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div style={darkMode ? stylesDark.sidebar : styles.sidebar} className={`filter-sidebar ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div style={darkMode ? stylesDark.header : styles.header}>
        <div style={styles.headerTitle}>
          <Filter size={24} color="#10b981" />
          <h2 style={darkMode ? stylesDark.title : styles.title}>Filters</h2>
          {activeFilterCount() > 0 && (
            <div style={styles.filterCount}>{activeFilterCount()}</div>
          )}
        </div>
        {activeFilterCount() > 0 && (
          <button
            style={darkMode ? stylesDark.clearButton : styles.clearButton}
            onClick={onClearAll}
            className="clear-filters-btn"
          >
            <X size={18} />
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      {resultCount !== undefined && (
        <div style={darkMode ? stylesDark.resultsCount : styles.resultsCount}>
          <span style={darkMode ? stylesDark.resultNumber : styles.resultNumber}>{resultCount}</span> properties found
        </div>
      )}

      {/* Price Range Filter */}
      <FilterSection
        title="Price per Night"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div style={styles.priceInputs}>
          <div style={styles.priceInput}>
            <DollarSign size={16} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.dollarIcon} />
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              style={darkMode ? stylesDark.input : styles.input}
              min="0"
            />
          </div>
          <div style={darkMode ? stylesDark.priceDivider : styles.priceDivider}>—</div>
          <div style={styles.priceInput}>
            <DollarSign size={16} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.dollarIcon} />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              style={darkMode ? stylesDark.input : styles.input}
              min="0"
            />
          </div>
        </div>

        {/* Quick Price Ranges */}
        <div style={styles.quickPrices}>
          <button
            style={filters.minPrice === 0 && filters.maxPrice === 100 ? (darkMode ? stylesDark.quickPriceActive : styles.quickPriceActive) : (darkMode ? stylesDark.quickPrice : styles.quickPrice)}
            onClick={() => onFilterChange({ ...filters, minPrice: 0, maxPrice: 100 })}
            className="quick-price-btn"
          >
            Under $100
          </button>
          <button
            style={filters.minPrice === 100 && filters.maxPrice === 200 ? (darkMode ? stylesDark.quickPriceActive : styles.quickPriceActive) : (darkMode ? stylesDark.quickPrice : styles.quickPrice)}
            onClick={() => onFilterChange({ ...filters, minPrice: 100, maxPrice: 200 })}
            className="quick-price-btn"
          >
            $100 - $200
          </button>
          <button
            style={filters.minPrice === 200 && filters.maxPrice === 500 ? (darkMode ? stylesDark.quickPriceActive : styles.quickPriceActive) : (darkMode ? stylesDark.quickPrice : styles.quickPrice)}
            onClick={() => onFilterChange({ ...filters, minPrice: 200, maxPrice: 500 })}
            className="quick-price-btn"
          >
            $200 - $500
          </button>
          <button
            style={filters.minPrice === 500 ? (darkMode ? stylesDark.quickPriceActive : styles.quickPriceActive) : (darkMode ? stylesDark.quickPrice : styles.quickPrice)}
            onClick={() => onFilterChange({ ...filters, minPrice: 500, maxPrice: '' })}
            className="quick-price-btn"
          >
            $500+
          </button>
        </div>
      </FilterSection>

      {/* Property Type Filter */}
      <FilterSection
        title="Property Type"
        isExpanded={expandedSections.propertyType}
        onToggle={() => toggleSection('propertyType')}
      >
        <div style={styles.propertyTypeGrid}>
          {propertyTypes.map(type => {
            const isSelected = (filters.propertyTypes || []).includes(type.id);
            return (
              <button
                key={type.id}
                style={isSelected ? (darkMode ? stylesDark.propertyTypeCardActive : styles.propertyTypeCardActive) : (darkMode ? stylesDark.propertyTypeCard : styles.propertyTypeCard)}
                onClick={() => handlePropertyTypeToggle(type.id)}
                className="property-type-btn"
              >
                <div style={isSelected ? styles.propertyIconActive : (darkMode ? stylesDark.propertyIcon : styles.propertyIcon)}>
                  {type.icon}
                </div>
                <span style={darkMode ? stylesDark.propertyLabel : styles.propertyLabel}>{type.label}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection
        title="Guest Rating"
        isExpanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <div style={styles.ratingOptions}>
          {ratings.map(rating => {
            const isSelected = filters.minRating === rating;
            return (
              <button
                key={rating}
                style={isSelected ? (darkMode ? stylesDark.ratingButtonActive : styles.ratingButtonActive) : (darkMode ? stylesDark.ratingButton : styles.ratingButton)}
                onClick={() => handleRatingChange(rating)}
                className="rating-btn"
              >
                <div style={styles.ratingStars}>
                  <Star size={16} fill={isSelected ? "#10b981" : "#fbbf24"} color={isSelected ? "#10b981" : "#fbbf24"} />
                  <span style={darkMode ? stylesDark.ratingNumber : styles.ratingNumber}>{rating}+</span>
                </div>
                <span style={darkMode ? stylesDark.ratingLabel : styles.ratingLabel}>
                  {rating >= 9 ? 'Wonderful' : rating >= 8 ? 'Very Good' : rating >= 7 ? 'Good' : 'Pleasant'}
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Amenities Filter */}
      <FilterSection
        title="Amenities"
        isExpanded={expandedSections.amenities}
        onToggle={() => toggleSection('amenities')}
      >
        <div style={styles.amenitiesList}>
          {amenitiesList.map(amenity => {
            const isSelected = (filters.amenities || []).includes(amenity.id);
            return (
              <button
                key={amenity.id}
                style={isSelected ? (darkMode ? stylesDark.amenityItemActive : styles.amenityItemActive) : (darkMode ? stylesDark.amenityItem : styles.amenityItem)}
                onClick={() => handleAmenityToggle(amenity.id)}
                className="amenity-btn"
              >
                <div style={isSelected ? styles.amenityIconActive : (darkMode ? stylesDark.amenityIcon : styles.amenityIcon)}>
                  {amenity.icon}
                </div>
                <span style={darkMode ? stylesDark.amenityLabel : styles.amenityLabel}>{amenity.label}</span>
                {isSelected && (
                  <div style={styles.checkmark}>✓</div>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
};

const styles = {
  sidebar: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    padding: '1.5rem',
    position: 'sticky',
    top: '20px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0fdf4',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  filterCount: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#fef2f2',
    color: '#ef4444',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resultsCount: {
    background: '#f0fdf4',
    padding: '0.75rem',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#047857',
    fontWeight: '500',
  },
  resultNumber: {
    fontWeight: '800',
    fontSize: '1.1rem',
    color: '#10b981',
  },
  filterSection: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  sectionContent: {
    padding: '1rem 0 0.5rem',
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  priceInput: {
    position: 'relative',
    flex: 1,
  },
  dollarIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1f2937',
    outline: 'none',
    transition: 'all 0.2s',
  },
  priceDivider: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  quickPrices: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  quickPrice: {
    padding: '0.6rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quickPriceActive: {
    padding: '0.6rem',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#047857',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  propertyTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  propertyTypeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.75rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  propertyTypeCardActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.75rem',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    transform: 'scale(1.05)',
  },
  propertyIcon: {
    color: '#6b7280',
  },
  propertyIconActive: {
    color: '#10b981',
  },
  propertyLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
  },
  ratingOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  ratingButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ratingButtonActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ratingStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ratingNumber: {
    fontWeight: '700',
    color: '#1f2937',
  },
  ratingLabel: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#6b7280',
  },
  amenitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  amenityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  amenityItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  amenityIcon: {
    color: '#6b7280',
  },
  amenityIconActive: {
    color: '#10b981',
  },
  amenityLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  checkmark: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
};

const stylesDark = {
  sidebar: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    padding: '1.5rem',
    position: 'sticky',
    top: '20px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid rgba(16, 185, 129, 0.2)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: 0,
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resultsCount: {
    background: 'rgba(16, 185, 129, 0.1)',
    padding: '0.75rem',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#10b981',
    fontWeight: '500',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  resultNumber: {
    fontWeight: '800',
    fontSize: '1.1rem',
    color: '#10b981',
  },
  filterSection: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
    paddingBottom: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: 0,
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#f3f4f6',
    background: 'rgba(255, 255, 255, 0.05)',
    outline: 'none',
    transition: 'all 0.2s',
  },
  priceDivider: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  quickPrice: {
    padding: '0.6rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quickPriceActive: {
    padding: '0.6rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid #10b981',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#10b981',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  propertyTypeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  propertyTypeCardActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.75rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid #10b981',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    transform: 'scale(1.05)',
  },
  propertyIcon: {
    color: '#9ca3af',
  },
  propertyLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
  },
  ratingButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ratingButtonActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid #10b981',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ratingNumber: {
    fontWeight: '700',
    color: '#f3f4f6',
  },
  ratingLabel: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#9ca3af',
  },
  amenityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  amenityItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid #10b981',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  amenityIcon: {
    color: '#9ca3af',
  },
  amenityLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#9ca3af',
    flex: 1,
  },
};

// Add global hover styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .filter-section-header:hover {
      background: #f9fafb;
      border-radius: 8px;
      padding: 0.75rem;
      margin: -0.75rem;
    }

    .clear-filters-btn:hover {
      background: #fee2e2;
      transform: translateY(-2px);
    }

    .quick-price-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    .property-type-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
    }

    .rating-btn:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .amenity-btn:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .filter-sidebar::-webkit-scrollbar {
      width: 8px;
    }

    .filter-sidebar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .filter-sidebar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 10px;
    }

    .filter-sidebar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }

    input[type="number"]:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 1;
    }

    /* Dark mode scrollbar */
    .filter-sidebar.dark-mode::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
  `;
  document.head.appendChild(style);
}

export default FilterSidebar;
