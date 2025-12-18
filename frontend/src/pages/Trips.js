import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { tripService } from '../services/api';
import {
  Search, Loader, Plane, Train, Bus, MapPin, Calendar,
  Filter, X, TrendingUp, Sparkles, ArrowRight, Globe,
  Clock, Users, ChevronDown, SlidersHorizontal, Grid, List,
  RefreshCw, Compass, Star, Zap
} from 'lucide-react';

function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [displayedTrips, setDisplayedTrips] = useState([]);
  const [displayCount, setDisplayCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.darkMode || false;
  });
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    transportType: '',
    date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTransport, setActiveTransport] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('price');

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for dark mode changes
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

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Check URL parameters on mount and auto-fill from smart search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    const to = urlParams.get('to');

    if (from || to) {
      const newFilters = {
        origin: from || '',
        destination: to || '',
        transportType: '',
        date: '',
      };
      setFilters(newFilters);

      const params = {};
      if (from) params.origin = from;
      if (to) params.destination = to;
      fetchTrips(params);
    } else {
      fetchTrips();
    }
  }, []);

  const fetchTrips = async (params = {}) => {
    setLoading(true);
    try {
      const response = await tripService.getAll(params);
      let tripsData = response.data.data || [];

      // Sort trips
      tripsData = sortTrips(tripsData, sortBy);

      setAllTrips(tripsData);
      setDisplayedTrips(tripsData.slice(0, 12));
      setDisplayCount(12);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortTrips = (tripsData, sortType) => {
    switch (sortType) {
      case 'price':
        return [...tripsData].sort((a, b) => a.price - b.price);
      case 'price_desc':
        return [...tripsData].sort((a, b) => b.price - a.price);
      case 'duration':
        return [...tripsData].sort((a, b) => {
          const durationA = new Date(a.arrivalTime) - new Date(a.departureTime);
          const durationB = new Date(b.arrivalTime) - new Date(b.departureTime);
          return durationA - durationB;
        });
      case 'departure':
        return [...tripsData].sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
      default:
        return tripsData;
    }
  };

  const handleSearch = () => {
    const params = {};
    if (filters.origin) params.origin = filters.origin;
    if (filters.destination) params.destination = filters.destination;
    if (filters.transportType) params.transportType = filters.transportType;
    fetchTrips(params);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const newCount = displayCount + 12;
      setDisplayedTrips(allTrips.slice(0, newCount));
      setDisplayCount(newCount);
      setLoadingMore(false);
    }, 500);
  };

  const handleTransportFilter = (type) => {
    const newType = activeTransport === type ? '' : type;
    setActiveTransport(newType);
    setFilters({...filters, transportType: newType});
    const params = {...filters, transportType: newType};
    const cleanParams = {};
    if (params.origin) cleanParams.origin = params.origin;
    if (params.destination) cleanParams.destination = params.destination;
    if (newType) cleanParams.transportType = newType;
    fetchTrips(cleanParams);
  };

  const handleReset = () => {
    setFilters({ origin: '', destination: '', transportType: '', date: '' });
    setActiveTransport('');
    setSortBy('price');
    fetchTrips();
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const sorted = sortTrips(allTrips, newSort);
    setAllTrips(sorted);
    setDisplayedTrips(sorted.slice(0, displayCount));
  };

  const transportOptions = [
    { type: 'flight', icon: Plane, label: 'Flights', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' },
    { type: 'train', icon: Train, label: 'Trains', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' },
    { type: 'bus', icon: Bus, label: 'Buses', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  ];

  // Popular destinations for quick search
  const popularRoutes = [
    { from: 'New York', to: 'Los Angeles', icon: '🗽' },
    { from: 'London', to: 'Paris', icon: '🗼' },
    { from: 'Tokyo', to: 'Osaka', icon: '🏯' },
    { from: 'Dubai', to: 'Mumbai', icon: '🕌' },
  ];

  const getStyles = () => ({
    container: {
      minHeight: '100vh',
      background: darkMode
        ? 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease',
    },
    // Hero Search Section
    heroSection: {
      background: darkMode
        ? 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)'
        : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      padding: isMobile ? '1.5rem 1rem' : '3rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
    heroContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    heroHeader: {
      textAlign: 'center',
      marginBottom: isMobile ? '1.25rem' : '2rem',
    },
    heroTitle: {
      fontSize: isMobile ? '1.5rem' : '3rem',
      fontWeight: '900',
      color: 'white',
      marginBottom: '0.5rem',
      textShadow: '0 2px 8px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '0.5rem' : '0.75rem',
    },
    heroSubtitle: {
      fontSize: isMobile ? '0.9rem' : '1.15rem',
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '500',
    },
    // Search Box
    searchBox: {
      background: darkMode ? 'rgba(255,255,255,0.08)' : 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '16px' : '24px',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: darkMode
        ? '0 20px 60px rgba(0,0,0,0.4)'
        : '0 20px 60px rgba(0,0,0,0.15)',
      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
    },
    searchRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto',
      gap: isMobile ? '0.75rem' : '1rem',
      alignItems: 'center',
    },
    searchInputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.25rem' : '0.375rem',
    },
    searchLabel: {
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      fontWeight: '700',
      color: darkMode ? '#9ca3af' : '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
    },
    searchInputWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '0.75rem',
      padding: isMobile ? '0.75rem' : '0.875rem 1rem',
      background: darkMode ? 'rgba(0,0,0,0.3)' : '#f9fafb',
      borderRadius: isMobile ? '12px' : '14px',
      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '2px solid #e5e7eb',
      transition: 'all 0.3s ease',
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: isMobile ? '0.95rem' : '1rem',
      fontWeight: '600',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      minWidth: 0,
      width: '100%',
    },
    searchButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.875rem 1.5rem' : '1rem 2.5rem',
      borderRadius: isMobile ? '12px' : '14px',
      background: darkMode
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: 'white',
      border: 'none',
      fontWeight: '700',
      fontSize: isMobile ? '0.95rem' : '1rem',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      width: isMobile ? '100%' : 'auto',
      minHeight: isMobile ? '48px' : '56px',
    },
    // Transport filters in search box
    transportRow: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '1rem',
      marginTop: isMobile ? '1rem' : '1.25rem',
      paddingTop: isMobile ? '1rem' : '1.25rem',
      borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
      flexWrap: 'wrap',
    },
    transportLabel: {
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    transportChipContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '1rem',
      flexWrap: 'wrap',
      flex: 1,
    },
    transportChip: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.375rem' : '0.5rem',
      padding: isMobile ? '0.5rem 0.875rem' : '0.625rem 1.25rem',
      borderRadius: isMobile ? '10px' : '12px',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
    },
    resetChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.5rem 0.875rem' : '0.625rem 1.25rem',
      borderRadius: isMobile ? '10px' : '12px',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginLeft: isMobile ? '0' : 'auto',
      border: 'none',
      background: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
      color: '#ef4444',
    },
    // Popular Routes
    popularRoutes: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '1.25rem',
      flexWrap: 'wrap',
    },
    popularLabel: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: 'rgba(255,255,255,0.7)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
    },
    popularChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    // Main Content
    mainContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '1rem 0.75rem' : '2rem',
    },
    // Controls Bar
    controlsBar: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: isMobile ? '1rem' : '2rem',
      flexWrap: 'wrap',
      gap: isMobile ? '0.75rem' : '1rem',
    },
    controlsLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    resultsBadge: {
      padding: isMobile ? '0.625rem 1rem' : '0.75rem 1.25rem',
      background: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
      borderRadius: '12px',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      fontWeight: '600',
      color: darkMode ? '#10b981' : '#047857',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    controlsRight: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '1rem',
      justifyContent: isMobile ? 'space-between' : 'flex-end',
    },
    viewToggle: {
      display: isMobile ? 'none' : 'flex',
      background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
      borderRadius: '12px',
      padding: '0.25rem',
      boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
    },
    viewButton: {
      padding: '0.6rem 0.8rem',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    viewButtonActive: {
      padding: '0.6rem 0.8rem',
      background: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#10b981',
    },
    sortSelect: {
      padding: isMobile ? '0.625rem 0.875rem' : '0.75rem 1.25rem',
      background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      fontWeight: '600',
      color: darkMode ? '#e5e7eb' : '#1f2937',
      cursor: 'pointer',
      outline: 'none',
      boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
      flex: isMobile ? 1 : 'none',
    },
    // Trips Grid
    tripsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : (viewMode === 'grid'
        ? 'repeat(auto-fill, minmax(380px, 1fr))'
        : '1fr'),
      gap: isMobile ? '1rem' : '1.5rem',
    },
    // Loading State
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '4rem 1rem' : '6rem 2rem',
      gap: '1.5rem',
    },
    loadingText: {
      fontSize: isMobile ? '1rem' : '1.1rem',
      fontWeight: '500',
      color: darkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
    },
    // Empty State
    empty: {
      textAlign: 'center',
      padding: isMobile ? '3rem 1rem' : '6rem 2rem',
      background: darkMode ? 'rgba(255,255,255,0.03)' : 'white',
      borderRadius: isMobile ? '16px' : '24px',
      boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
    },
    emptyIcon: {
      width: isMobile ? '80px' : '120px',
      height: isMobile ? '80px' : '120px',
      background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
    },
    emptyTitle: {
      fontSize: isMobile ? '1.25rem' : '1.75rem',
      fontWeight: '700',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      marginBottom: '0.75rem',
    },
    emptyText: {
      fontSize: isMobile ? '0.95rem' : '1.1rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '2rem',
      maxWidth: '500px',
      margin: '0 auto 1.5rem auto',
    },
    emptyButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      fontWeight: '700',
      fontSize: isMobile ? '0.95rem' : '1rem',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.3s ease',
    },
    // Load More
    loadMoreContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: isMobile ? '2rem' : '3rem',
      marginBottom: isMobile ? '1rem' : '2rem',
    },
    loadMoreButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      padding: isMobile ? '1rem 2rem' : '1.25rem 3rem',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      fontWeight: '700',
      fontSize: isMobile ? '1rem' : '1.1rem',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.3s ease',
      width: isMobile ? '100%' : 'auto',
    },
    loadMoreCount: {
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: '500',
      opacity: 0.9,
    },
  });

  const styles = getStyles();

  return (
    <div style={styles.container}>
      {/* Hero Search Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          {/* Header */}
          <div style={styles.heroHeader}>
            <h1 style={styles.heroTitle}>
              <Globe size={40} />
              Book Your Journey
            </h1>
            <p style={styles.heroSubtitle}>
              Discover premium travel experiences to destinations worldwide
            </p>
          </div>

          {/* Search Box */}
          <div style={styles.searchBox}>
            <div style={styles.searchRow}>
              {/* From */}
              <div style={styles.searchInputGroup}>
                <div style={styles.searchLabel}>
                  <MapPin size={14} color="#10b981" />
                  From
                </div>
                <div style={styles.searchInputWrapper}>
                  <Compass size={20} color="#10b981" />
                  <input
                    type="text"
                    placeholder="City or Airport"
                    value={filters.origin}
                    onChange={(e) => setFilters({...filters, origin: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              {/* To */}
              <div style={styles.searchInputGroup}>
                <div style={styles.searchLabel}>
                  <MapPin size={14} color="#f59e0b" />
                  To
                </div>
                <div style={styles.searchInputWrapper}>
                  <MapPin size={20} color="#f59e0b" />
                  <input
                    type="text"
                    placeholder="City or Airport"
                    value={filters.destination}
                    onChange={(e) => setFilters({...filters, destination: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              {/* Date */}
              <div style={styles.searchInputGroup}>
                <div style={styles.searchLabel}>
                  <Calendar size={14} color="#8b5cf6" />
                  Date
                </div>
                <div style={styles.searchInputWrapper}>
                  <Calendar size={20} color="#8b5cf6" />
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                style={styles.searchButton}
                className="search-btn-hover"
              >
                <Search size={20} />
                Search
              </button>
            </div>

            {/* Transport Type Filters */}
            <div style={styles.transportRow}>
              <span style={styles.transportLabel}>
                <Filter size={16} />
                Transport Type:
              </span>

              {transportOptions.map((transport) => {
                const Icon = transport.icon;
                const isActive = activeTransport === transport.type;

                return (
                  <button
                    key={transport.type}
                    onClick={() => handleTransportFilter(transport.type)}
                    style={{
                      ...styles.transportChip,
                      background: isActive
                        ? transport.gradient
                        : darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                      color: isActive ? 'white' : darkMode ? '#9ca3af' : '#6b7280',
                      boxShadow: isActive ? `0 4px 12px ${transport.color}40` : 'none',
                    }}
                    className="transport-chip-hover"
                  >
                    <Icon size={18} />
                    {transport.label}
                  </button>
                );
              })}

              {(filters.origin || filters.destination || filters.transportType) && (
                <button
                  onClick={handleReset}
                  style={styles.resetChip}
                  className="reset-chip-hover"
                >
                  <X size={16} />
                  Reset All
                </button>
              )}
            </div>
          </div>

          {/* Popular Routes */}
          <div style={styles.popularRoutes}>
            <span style={styles.popularLabel}>
              <Zap size={14} />
              Popular:
            </span>
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => {
                  setFilters({ ...filters, origin: route.from, destination: route.to });
                  fetchTrips({ origin: route.from, destination: route.to });
                }}
                style={styles.popularChip}
                className="popular-chip-hover"
              >
                {route.icon} {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Controls Bar */}
        <div style={styles.controlsBar}>
          <div style={styles.controlsLeft}>
            {allTrips.length > 0 && (
              <div style={styles.resultsBadge}>
                <TrendingUp size={18} />
                <span><strong>{allTrips.length}</strong> trips found</span>
              </div>
            )}
          </div>

          <div style={styles.controlsRight}>
            {/* View Mode Toggle */}
            <div style={styles.viewToggle}>
              <button
                style={viewMode === 'grid' ? styles.viewButtonActive : styles.viewButton}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                style={viewMode === 'list' ? styles.viewButtonActive : styles.viewButton}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="price">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration">Shortest Duration</option>
              <option value="departure">Earliest Departure</option>
            </select>
          </div>
        </div>

        {/* Trips Content */}
        {loading ? (
          <div style={styles.loading}>
            <Loader size={48} color="#10b981" className="spinner" />
            <p style={styles.loadingText}>Finding the best trips for you...</p>
          </div>
        ) : displayedTrips.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <Plane size={48} color="#10b981" />
            </div>
            <h3 style={styles.emptyTitle}>No trips found</h3>
            <p style={styles.emptyText}>
              Try adjusting your filters or search for a different destination
            </p>
            <button
              onClick={handleReset}
              style={styles.emptyButton}
              className="empty-btn-hover"
            >
              <RefreshCw size={20} />
              Explore All Trips
            </button>
          </div>
        ) : (
          <>
            <div style={styles.tripsGrid}>
              {displayedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayedTrips.length < allTrips.length && (
              <div style={styles.loadMoreContainer}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    ...styles.loadMoreButton,
                    opacity: loadingMore ? 0.7 : 1,
                  }}
                  className="load-more-btn-hover"
                >
                  {loadingMore ? (
                    <>
                      <Loader size={20} className="spinner" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Trips</span>
                      <span style={styles.loadMoreCount}>
                        (Showing {displayedTrips.length} of {allTrips.length})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .search-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .transport-chip-hover:hover {
          transform: translateY(-2px);
        }

        .reset-chip-hover:hover {
          background: #fecaca !important;
          transform: translateY(-2px);
        }

        .popular-chip-hover:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .load-more-btn-hover:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(16, 185, 129, 0.5);
        }

        .empty-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
        }

        @media (max-width: 1024px) {
          .search-row {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .trips-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Trips;
