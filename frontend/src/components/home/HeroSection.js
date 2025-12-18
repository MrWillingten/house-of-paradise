import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, TrendingUp, Star, Zap } from 'lucide-react';
import api from '../../services/api';
import '../../styles/animations.css';

const HeroSection = ({ darkMode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const [liveStats, setLiveStats] = useState({ hotels: 0, bookings: 0, travelers: 0 });
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Popular quick search destinations
  const popularDestinations = [
    { name: 'Paris', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
    { name: 'Tokyo', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop' },
    { name: 'New York', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
    { name: 'Dubai', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop' },
  ];

  // Fetch live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/hotels');
        if (response.data.success) {
          setLiveStats({
            hotels: response.data.pagination.total || response.data.data.length,
            bookings: Math.floor(Math.random() * 500) + 200, // Mock for now
            travelers: Math.floor(Math.random() * 2000) + 1000, // Mock for now
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Handle AI-Powered Smart Search
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      navigate('/hotels');
      return;
    }

    try {
      // Call smart search API to analyze the query
      const response = await api.post('/api/smart-search', {
        query: query.trim()
      });

      if (response.data.success) {
        const analysis = response.data;

        if (analysis.type === 'trip') {
          // Navigate to Trips page with from/to parameters
          const params = new URLSearchParams();
          if (analysis.from) params.append('from', analysis.from);
          if (analysis.to) params.append('to', analysis.to);
          params.append('query', query.trim());

          navigate(`/trips?${params.toString()}`);
        } else {
          // Navigate to Hotels page with location and hotel name
          const params = new URLSearchParams();
          if (analysis.location) params.append('location', analysis.location);
          if (analysis.hotelName) params.append('hotelName', analysis.hotelName);
          params.append('query', query.trim());

          navigate(`/hotels?${params.toString()}`);
        }
      } else {
        // Fallback to simple hotel search
        navigate(`/hotels?search=${encodeURIComponent(query.trim())}`);
      }
    } catch (error) {
      console.error('Smart search error:', error);
      // Fallback to simple hotel search
      navigate(`/hotels?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQuickSearch = (destination) => {
    navigate(`/hotels?location=${encodeURIComponent(destination)}`);
  };

  return (
    <section
      style={{
        ...styles.hero,
        padding: isMobile ? '1.5rem 0.75rem' : '2rem',
        minHeight: isMobile ? 'auto' : '100vh',
        paddingTop: isMobile ? '2rem' : '2rem',
        paddingBottom: isMobile ? '2rem' : '2rem',
        background: darkMode
          ? 'radial-gradient(ellipse at top, #0a0a1a 0%, #050510 50%, #000000 100%)'
          : 'linear-gradient(to bottom, #a8d5e2 0%, #b8dfe8 20%, #d4e9f2 50%, #e8f4f8 80%, #f5f9fc 100%)',
      }}
    >
      {/* Sky Background (Light Mode) */}
      {!darkMode && (
        <div className="photorealistic-sky" style={styles.skyBackground}>
          {[...Array(8)].map((_, i) => (
            <div
              key={`cirrus-${i}`}
              className="cirrus-cloud"
              style={{
                position: 'absolute',
                left: `${(i * 15 + 5) % 100}%`,
                top: `${8 + (i % 3) * 12}%`,
                width: `${200 + i * 30}px`,
                height: `${40 + i * 8}px`,
                background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${0.3 + (i % 3) * 0.1}), transparent)`,
                filter: 'blur(12px)',
                opacity: 0.6,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Shooting Stars (Dark Mode) */}
      {darkMode && (
        <div style={styles.shootingStarsContainer}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={`star-${num}`}
              className={`shooting-star-wrapper shooting-star-${num}`}
              style={{
                position: 'absolute',
                top: `${15 + num * 10}%`,
                [num % 2 === 0 ? 'right' : 'left']: '-100px',
                animation: `${num % 2 === 0 ? 'shootRightToLeft' : 'shootLeftToRight'}1 ${8 + num}s ease-in-out ${num * 1.5}s infinite`,
              }}
            >
              <div
                className="star-glow-trail"
                style={{
                  position: 'absolute',
                  width: '120px',
                  height: '3px',
                  background: `linear-gradient(to ${num % 2 === 0 ? 'left' : 'right'}, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))`,
                  [num % 2 === 0 ? 'left' : 'right']: '40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  filter: 'blur(4px)',
                }}
              ></div>
              <div
                className="shooting-star"
                style={{
                  fontSize: '2.5rem',
                  color: '#FFD700',
                  textShadow: '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.6)',
                }}
              >
                ★
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        ...styles.heroContent,
        padding: isMobile ? '0 0.5rem' : 0,
      }}>
        {/* Live Stats Bar */}
        <div style={{
          ...styles.statsBar,
          gap: isMobile ? '0.75rem' : '3rem',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div className="scroll-reveal" style={{
            ...styles.statItem,
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
          }}>
            <TrendingUp size={isMobile ? 16 : 20} color="#10b981" />
            <span style={{ color: darkMode ? '#fff' : '#1f2937' }}>
              <strong>{liveStats.hotels}+</strong> Hotels
            </span>
          </div>
          <div className="scroll-reveal" style={{
            ...styles.statItem,
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
          }}>
            <Zap size={isMobile ? 16 : 20} color="#f59e0b" />
            <span style={{ color: darkMode ? '#fff' : '#1f2937' }}>
              <strong>{liveStats.bookings}+</strong> Bookings Today
            </span>
          </div>
          <div className="scroll-reveal" style={{
            ...styles.statItem,
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
          }}>
            <Users size={isMobile ? 16 : 20} color="#8b5cf6" />
            <span style={{ color: darkMode ? '#fff' : '#1f2937' }}>
              <strong>{liveStats.travelers}+</strong> Happy Travelers
            </span>
          </div>
        </div>

        {/* Epic Paradise Title */}
        <div className="paradise-title-container" style={{
          ...styles.titleContainer,
          marginBottom: isMobile ? '1rem' : '1.5rem',
        }}>
          <h1 className="paradise-title" style={{
            ...styles.paradiseTitle,
            fontSize: isMobile ? '2.5rem' : '6.5rem',
          }}>
            <span className="word-line">House of</span>
            <span className="word-paradise">
              Paradise
              <span className="paradise-glow-contained"></span>
            </span>
          </h1>

          <div className="paradise-particles">
            {[...Array(isMobile ? 10 : 20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${40 + Math.random() * 30}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <p style={{
          ...styles.heroSubtitle,
          fontSize: isMobile ? '1rem' : '1.5rem',
          marginBottom: isMobile ? '1.5rem' : '3rem',
        }}>
          Discover <span className="luxury-word">luxury</span> destinations worldwide
        </p>

        {/* Powerful Search Bar */}
        <div style={{
          ...styles.searchContainer,
          marginBottom: isMobile ? '2rem' : '3rem',
          padding: isMobile ? '0 0.5rem' : 0,
        }}>
          <div
            style={{
              ...styles.enhancedSearchBar,
              background: darkMode ? '#1e293b' : 'white',
              border: darkMode ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(16, 185, 129, 0.2)',
              boxShadow: isSearchFocused
                ? darkMode
                  ? '0 30px 80px rgba(16, 185, 129, 0.25), 0 0 20px rgba(16, 185, 129, 0.15)'
                  : '0 30px 80px rgba(16, 185, 129, 0.3)'
                : darkMode
                  ? '0 20px 60px rgba(0,0,0,0.4)'
                  : '0 20px 60px rgba(0,0,0,0.15)',
              transform: isSearchFocused ? 'scale(1.02)' : 'scale(1)',
              flexDirection: isMobile ? 'column' : 'row',
              padding: isMobile ? '1rem' : '0.75rem',
              gap: isMobile ? '0.75rem' : '0',
              borderRadius: isMobile ? '16px' : '20px',
            }}
            className="spotlight-card"
          >
            <div style={{
              ...styles.searchIconWrapper,
              display: isMobile ? 'none' : 'flex',
            }}>
              <Search size={24} color="#10b981" />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
              width: isMobile ? '100%' : 'auto',
              background: darkMode ? '#0f172a' : '#f9fafb',
              borderRadius: isMobile ? '12px' : '10px',
              padding: isMobile ? '0.75rem 1rem' : '0.5rem 0.75rem',
              border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
            }}>
              {isMobile && <Search size={20} color="#10b981" />}
              <input
                type="text"
                placeholder={isMobile ? "Where to?" : "Where would you like to go? (e.g., Paris, Tokyo, Beach Resort...)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  ...styles.searchInput,
                  background: 'transparent',
                  color: darkMode ? '#f1f5f9' : '#1f2937',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  padding: isMobile ? '0.5rem 0' : '1rem 0.5rem',
                }}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              style={{
                ...styles.enhancedSearchButton,
                width: isMobile ? '100%' : 'auto',
                padding: isMobile ? '0.875rem 1.5rem' : '1rem 2.5rem',
                borderRadius: isMobile ? '12px' : '14px',
                fontSize: isMobile ? '1rem' : '1.05rem',
                justifyContent: 'center',
              }}
              className="clickable search-btn-glow"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Quick Destination Cards */}
        <div style={{
          ...styles.quickDestinations,
          marginBottom: isMobile ? '2rem' : '3rem',
          display: isMobile ? 'none' : 'block',
        }}>
          <p style={{ ...styles.quickLabel, color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Popular Destinations
          </p>
          <div style={{
            ...styles.destinationCards,
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: isMobile ? '0.75rem' : '1rem',
          }}>
            {popularDestinations.map((dest, index) => (
              <div
                key={index}
                className="scroll-reveal spotlight-card hover-lift clickable"
                style={{
                  ...styles.destinationCard,
                  height: isMobile ? '90px' : '120px',
                  background: darkMode ? '#1a1a2e' : '#ffffff',
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${dest.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onClick={() => handleQuickSearch(dest.name)}
              >
                <div style={styles.destinationOverlay}>
                  <span style={{
                    ...styles.destinationFlag,
                    fontSize: isMobile ? '1.75rem' : '2.5rem',
                  }}>{dest.flag}</span>
                  <span style={{
                    ...styles.destinationName,
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                  }}>{dest.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{
          ...styles.trustBadges,
          gap: isMobile ? '0.75rem' : '2rem',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div className="scroll-reveal" style={{
            ...styles.badge,
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
          }}>
            <Star size={isMobile ? 14 : 16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ color: darkMode ? '#fff' : '#1f2937' }}>4.8/5 Rating</span>
          </div>
          <div className="scroll-reveal" style={{
            ...styles.badge,
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
          }}>
            <Users size={isMobile ? 14 : 16} color="#10b981" />
            <span style={{ color: darkMode ? '#fff' : '#1f2937' }}>2M+ Travelers</span>
          </div>
          <div className="scroll-reveal" style={{
            ...styles.badge,
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
          }}>
            <Zap size={isMobile ? 14 : 16} color="#8b5cf6" />
            <span style={{ color: darkMode ? '#fff' : '#1f2937' }}>Instant Booking</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'background 1.2s ease',
    width: '100%',
    padding: '2rem',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  shootingStarsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 5,
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '1200px',
    width: '100%',
    overflow: 'visible',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  titleContainer: {
    position: 'relative',
    marginBottom: '1.5rem',
    overflow: 'visible',
    width: '100%',
  },
  paradiseTitle: {
    fontSize: '6.5rem',
    fontWeight: '900',
    lineHeight: 1.2,
    position: 'relative',
    overflow: 'visible',
    width: '100%',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    color: '#6b7280',
    marginBottom: '3rem',
    fontWeight: '500',
    transition: 'color 1s ease',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '3rem',
  },
  enhancedSearchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '20px',
    padding: '0.75rem',
    maxWidth: '800px',
    width: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '2px solid rgba(16, 185, 129, 0.2)',
  },
  searchIconWrapper: {
    padding: '0 1rem',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1.1rem',
    padding: '1rem 0.5rem',
    fontWeight: '500',
  },
  enhancedSearchButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2.5rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '1.05rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  quickDestinations: {
    marginBottom: '3rem',
  },
  quickLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  destinationCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  destinationCard: {
    height: '120px',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '2px solid transparent',
  },
  destinationOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  destinationFlag: {
    fontSize: '2.5rem',
  },
  destinationName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'white',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  trustBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    fontSize: '0.95rem',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.25)',
  },
};

export default HeroSection;
