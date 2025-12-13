import React, { useState, useEffect } from 'react';
import HotelCard from '../components/HotelCard';
import FilterSidebar from '../components/FilterSidebar';
import MapView from '../components/MapView';
import { hotelService } from '../services/api';
import { Search, Loader, SlidersHorizontal, Grid, List, Map, TrendingUp, DollarSign, Star as StarIcon } from 'lucide-react';

function Hotels() {
  const [allHotels, setAllHotels] = useState([]); // All fetched hotels
  const [displayedHotels, setDisplayedHotels] = useState([]); // Hotels currently shown
  const [displayCount, setDisplayCount] = useState(15); // Number to display
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'map'
  const [sortBy, setSortBy] = useState('rating');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.darkMode || false;
  });

  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    propertyTypes: [],
    amenities: [],
  });

  useEffect(() => {
    fetchHotels();
  }, [filters, sortBy]);

  // Update body class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Listen for dark mode changes from Navbar or other components
  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.darkMode !== undefined && user.darkMode !== darkMode) {
        setDarkMode(user.darkMode);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [darkMode]);

  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location');
    const hotelName = urlParams.get('hotelName');
    const query = urlParams.get('query');

    if (location || hotelName) {
      setFilters(prev => ({
        ...prev,
        location: location || prev.location
      }));

      // Store hotel name for prioritizing in results
      if (hotelName) {
        setSearchTerm(hotelName);
      }
    }
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
      };

      // Add filters to params
      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;

      // Property types
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        params.propertyType = filters.propertyTypes[0]; // API supports one at a time, we'll filter client-side for multiple
      }

      // Amenities
      if (filters.amenities && filters.amenities.length > 0) {
        params.amenities = filters.amenities;
      }

      const response = await hotelService.getAll(params);
      let hotelsData = response.data.data;

      // Client-side filtering for multiple property types
      if (filters.propertyTypes && filters.propertyTypes.length > 1) {
        hotelsData = hotelsData.filter(hotel =>
          filters.propertyTypes.includes(hotel.propertyType)
        );
      }

      // If searching for a specific hotel, prioritize it
      const urlParams = new URLSearchParams(window.location.search);
      const hotelName = urlParams.get('hotelName');
      if (hotelName) {
        const lowerSearchName = hotelName.toLowerCase();
        hotelsData = hotelsData.sort((a, b) => {
          const aMatch = a.name.toLowerCase().includes(lowerSearchName);
          const bMatch = b.name.toLowerCase().includes(lowerSearchName);
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }

      // Remove duplicates based on _id
      const uniqueHotels = hotelsData.filter((hotel, index, self) =>
        index === self.findIndex((h) => h._id === hotel._id)
      );

      setAllHotels(uniqueHotels);
      setDisplayedHotels(uniqueHotels.slice(0, 15)); // Show first 15
      setDisplayCount(15); // Reset display count
    } catch (error) {
      console.error('Error fetching hotels:', error);
      alert('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const newCount = displayCount + 15;
      setDisplayedHotels(allHotels.slice(0, newCount));
      setDisplayCount(newCount);
      setLoadingMore(false);
    }, 500); // Small delay for UX
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearAll = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      propertyTypes: [],
      amenities: [],
    });
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      location: searchTerm
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle map bounds change for real-time refresh
  const handleMapBoundsChange = async (mapData) => {
    console.log('🗺️  Map bounds changed, fetching hotels in view...', mapData);

    try {
      // Extract approximate location from center coordinates
      // For now, just refetch with current filters
      // In production, you'd use reverse geocoding API
      const params = {
        sortBy,
      };

      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;

      const response = await hotelService.getAll(params);
      let hotelsData = response.data.data;

      // Filter hotels within map bounds
      hotelsData = hotelsData.filter(hotel => {
        if (!hotel.coordinates) return false;
        const lat = hotel.coordinates.lat;
        const lng = hotel.coordinates.lng;
        return (
          lat >= mapData.bounds.south &&
          lat <= mapData.bounds.north &&
          lng >= mapData.bounds.west &&
          lng <= mapData.bounds.east
        );
      });

      setAllHotels(hotelsData);
      setDisplayedHotels(hotelsData.slice(0, 15));
      setDisplayCount(15);
      console.log(`✅ Refreshed ${hotelsData.length} hotels in map view`);
    } catch (error) {
      console.error('Error refreshing hotels for map view:', error);
    }
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb',
    }} className={darkMode ? 'dark-mode' : ''}>
      {/* Header with Search */}
      <div style={{
        ...styles.header,
        background: darkMode
          ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Find Your Perfect Stay</h1>
          <p style={styles.subtitle}>Discover amazing places with real-time availability and best prices</p>
        </div>

        {/* Search Bar */}
        <div style={styles.searchSection}>
          <div style={{
            ...styles.searchBar,
            background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
            backdropFilter: darkMode ? 'blur(10px)' : 'none',
          }}>
            <Search size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                ...styles.searchInput,
                color: darkMode ? '#f3f4f6' : '#1f2937',
              }}
            />
            <button onClick={handleSearch} style={{
              ...styles.searchButton,
              background: darkMode
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.main,
        background: darkMode ? '#0a0a0a' : '#f9fafb',
      }}>
        <div style={styles.contentWrapper}>
          {/* Filter Toggle & Controls */}
          <div style={styles.controls}>
            <div style={styles.controlsLeft}>
              <button
                style={{
                  ...styles.filterToggle,
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                  border: darkMode ? '2px solid rgba(16, 185, 129, 0.2)' : '2px solid #e5e7eb',
                  color: darkMode ? '#e5e7eb' : '#1f2937',
                }}
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-btn"
              >
                <SlidersHorizontal size={20} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {allHotels.length > 0 && (
                <div style={{
                  ...styles.resultsBadge,
                  background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
                  color: darkMode ? '#10b981' : '#047857',
                }}>
                  <span style={styles.resultsNumber}>{allHotels.length}</span> properties found
                </div>
              )}
            </div>

            <div style={styles.controlsRight}>
              {/* View Mode Toggle */}
              <div style={{
                ...styles.viewModeToggle,
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
              }}>
                <button
                  style={{
                    ...(viewMode === 'grid' ? {
                      ...styles.viewButtonActive,
                      background: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4',
                      color: '#10b981',
                    } : {
                      ...styles.viewButton,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    })
                  }}
                  onClick={() => setViewMode('grid')}
                  className="view-mode-btn"
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  style={{
                    ...(viewMode === 'list' ? {
                      ...styles.viewButtonActive,
                      background: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4',
                      color: '#10b981',
                    } : {
                      ...styles.viewButton,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    })
                  }}
                  onClick={() => setViewMode('list')}
                  className="view-mode-btn"
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button
                  style={{
                    ...(viewMode === 'map' ? {
                      ...styles.viewButtonActive,
                      background: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4',
                      color: '#10b981',
                    } : {
                      ...styles.viewButton,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    })
                  }}
                  onClick={() => setViewMode('map')}
                  className="view-mode-btn"
                  title="Map View"
                >
                  <Map size={18} />
                </button>
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  ...styles.sortSelect,
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                  border: darkMode ? '2px solid rgba(16, 185, 129, 0.2)' : '2px solid #e5e7eb',
                  color: darkMode ? '#e5e7eb' : '#1f2937',
                }}
                className="sort-select"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="discount">💸 Best Discounts</option>
              </select>
            </div>
          </div>

          {/* Layout */}
          <div style={styles.layout}>
            {/* Filters Sidebar */}
            {showFilters && (
              <div style={styles.sidebarContainer}>
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAll}
                  resultCount={allHotels.length}
                  darkMode={darkMode}
                />
              </div>
            )}

            {/* Hotels Grid/List */}
            <div style={{
              ...styles.hotelsContainer,
              flex: showFilters ? '1' : '1',
              maxWidth: showFilters ? 'none' : '1400px',
              margin: showFilters ? '0' : '0 auto'
            }}>
              {loading ? (
                <div style={styles.loading}>
                  <Loader size={48} style={{
                    ...styles.spinner,
                    color: '#10b981',
                  }} className="spinner" />
                  <p style={{
                    ...styles.loadingText,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>Finding the best hotels for you...</p>
                </div>
              ) : displayedHotels.length === 0 ? (
                <div style={{
                  ...styles.empty,
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'white',
                  boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  <div style={styles.emptyIcon}>🏨</div>
                  <h3 style={{
                    ...styles.emptyTitle,
                    color: darkMode ? '#f3f4f6' : '#1f2937',
                  }}>No hotels found</h3>
                  <p style={{
                    ...styles.emptyText,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}>
                    Try adjusting your filters or search criteria
                  </p>
                  <button style={styles.resetButton} onClick={handleClearAll}>
                    Clear All Filters
                  </button>
                </div>
              ) : viewMode === 'map' ? (
                <MapView
                  hotels={allHotels}
                  selectedHotel={selectedHotel}
                  onHotelClick={setSelectedHotel}
                  onMapBoundsChange={handleMapBoundsChange}
                />
              ) : (
                <>
                  <div style={
                    viewMode === 'grid'
                      ? styles.hotelsGrid
                      : styles.hotelsList
                  }>
                    {displayedHotels.map((hotel) => (
                      <HotelCard key={hotel._id} hotel={hotel} darkMode={darkMode} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {displayedHotels.length < allHotels.length && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '3rem',
                      marginBottom: '2rem'
                    }}>
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        style={{
                          ...styles.loadMoreButton,
                          background: darkMode
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          opacity: loadingMore ? 0.7 : 1
                        }}
                        className="load-more-button"
                      >
                        {loadingMore ? (
                          <>
                            <Loader size={20} className="spinner-icon" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Hotels</span>
                            <span style={{
                              ...styles.loadMoreCount,
                              color: 'rgba(255,255,255,0.8)'
                            }}>
                              (Showing {displayedHotels.length} of {allHotels.length})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  header: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '3rem 2rem 2rem',
    color: 'white',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto 2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.95,
    fontWeight: '500',
  },
  searchSection: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'white',
    padding: '0.75rem 1.25rem',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    color: '#1f2937',
    fontWeight: '500',
  },
  searchButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  main: {
    background: '#f9fafb',
    minHeight: 'calc(100vh - 250px)',
  },
  contentWrapper: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '2rem',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  controlsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1f2937',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  resultsBadge: {
    padding: '0.75rem 1.25rem',
    background: '#f0fdf4',
    borderRadius: '12px',
    fontSize: '0.9rem',
    color: '#047857',
    fontWeight: '500',
  },
  resultsNumber: {
    fontWeight: '800',
    fontSize: '1rem',
    color: '#10b981',
  },
  viewModeToggle: {
    display: 'flex',
    background: 'white',
    borderRadius: '12px',
    padding: '0.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  viewButton: {
    padding: '0.6rem 0.8rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewButtonActive: {
    padding: '0.6rem 0.8rem',
    background: '#f0fdf4',
    border: 'none',
    borderRadius: '8px',
    color: '#10b981',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sortSelect: {
    padding: '0.75rem 1.25rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1f2937',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  },
  sidebarContainer: {
    width: '320px',
    flexShrink: 0,
  },
  hotelsContainer: {
    flex: 1,
  },
  hotelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  hotelsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    gap: '1.5rem',
  },
  spinner: {
    color: '#10b981',
  },
  loadingText: {
    fontSize: '1.1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '6rem 2rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  resetButton: {
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
  loadMoreButton: {
    padding: '1.25rem 3rem',
    borderRadius: '16px',
    border: 'none',
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  loadMoreCount: {
    fontSize: '0.9rem',
    fontWeight: '500',
    opacity: 0.9,
  },
};

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    .filter-toggle-btn:hover {
      background: #f0fdf4;
      border-color: #10b981;
      color: #047857;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .view-mode-btn:hover {
      background: #f9fafb;
    }

    .sort-select:hover {
      border-color: #10b981;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
    }

    .sort-select:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    input[type="text"]:focus {
      outline: 2px solid #10b981;
      outline-offset: 2px;
    }

    .searchButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .resetButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .load-more-button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .load-more-button:hover:not(:disabled) {
      transform: translateY(-4px);
      box-shadow: 0 12px 36px rgba(16, 185, 129, 0.5);
    }

    .load-more-button:active:not(:disabled) {
      transform: translateY(-2px);
    }

    .load-more-button:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    @media (max-width: 1024px) {
      .sidebarContainer {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Hotels;
