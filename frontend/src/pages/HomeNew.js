import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Search, X, ChevronLeft, ChevronRight,
  Shield, Clock, Award, DollarSign, Train, Plane as PlaneIcon, Bus,
  Zap, Star, TrendingUp, CheckCircle, Mail, Sparkles, Target, Package
} from 'lucide-react';
import RecommendedForYou from '../components/RecommendedForYou';
import RecentlyViewed from '../components/RecentlyViewed';

function Home() {
  const navigate = useNavigate();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.darkMode || false;
  });
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [passengers, setPassengers] = useState({ adults: 2, children: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // New sections state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  // Removed cursor interaction that was making particles go crazy
  // Particles now have consistent, smooth animations

  // Trigger page load animation
  useEffect(() => {
    // Small delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also check localStorage periodically for changes in same tab
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    // Save to user account
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.darkMode = newMode;
    localStorage.setItem('user', JSON.stringify(user));
  };

  const destinations = [
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'Turkey', flag: '🇹🇷' },
    { name: 'Egypt', flag: '🇪🇬' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Ireland', flag: '🇮🇪' },
    { name: 'Finland', flag: '🇫🇮' },
    { name: 'Italy', flag: '🇮🇹' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Russia', flag: '🇷🇺' },
    { name: 'Israel', flag: '🇮🇱' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Australia', flag: '🇦🇺' },
  ];

  const allDestinations = [
    {
      name: 'Dubai, UAE',
      images: [
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        'https://images.unsplash.com/photo-1518684079-3c830dcef090'
      ],
      description: 'Luxury desert metropolis',
      price: 'From $699',
      transport: 'plane'
    },
    {
      name: 'Tokyo, Japan',
      images: [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26'
      ],
      description: 'Modern culture hub',
      price: 'From $899',
      transport: 'plane'
    },
    {
      name: 'New York, USA',
      images: [
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
        'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625'
      ],
      description: 'City that never sleeps',
      price: 'From $599',
      transport: 'plane'
    },
    {
      name: 'Paris, France',
      images: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'
      ],
      description: 'Romantic European capital',
      price: 'From $799',
      transport: 'train'
    },
    {
      name: 'Rome, Italy',
      images: [
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
        'https://images.unsplash.com/photo-1529260830199-42c24126f198'
      ],
      description: 'Ancient historical city',
      price: 'From $649',
      transport: 'train'
    },
    {
      name: 'Barcelona, Spain',
      images: [
        'https://images.unsplash.com/photo-1562883676-8c7feb83f09b',
        'https://images.unsplash.com/photo-1539037116277-4db20889f2d4'
      ],
      description: 'Coastal artistic paradise',
      price: 'From $499',
      transport: 'bus'
    },
    {
      name: 'Amsterdam, Netherlands',
      images: [
        'https://images.unsplash.com/photo-1534351590666-13e3e96b5017',
        'https://images.unsplash.com/photo-1584003564911-c8b2a78bfd1c'
      ],
      description: 'Canal city charm',
      price: 'From $549',
      transport: 'bus'
    },
  ];

  const whyHoP = [
    {
      icon: <Shield size={36} />,
      title: 'Secure Booking',
      description: 'Enterprise-grade security',
      gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
    },
    {
      icon: <DollarSign size={36} />,
      title: 'Best Price',
      description: 'Guaranteed lowest prices',
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    },
    {
      icon: <Clock size={36} />,
      title: '24/7 Support',
      description: 'Always here to help',
      gradient: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)'
    },
    {
      icon: <Award size={36} />,
      title: 'Trusted Worldwide',
      description: '2M+ happy travelers',
      gradient: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)'
    },
  ];

  // Testimonials Data (Mock for now)
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, USA",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5,
      text: "House of Paradise made our dream vacation a reality! The booking process was seamless, and the deals were unbeatable. We saved over $800 on our Bali trip!",
      destination: "Bali, Indonesia",
      date: "November 2024"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Singapore",
      avatar: "https://i.pravatar.cc/150?img=7",
      rating: 5,
      text: "Best travel booking platform I've ever used. The customer support is phenomenal - they helped us change our flights at 2 AM with no hassle. Highly recommend!",
      destination: "Paris, France",
      date: "December 2024"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      location: "Barcelona, Spain",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      text: "The price comparison feature is amazing! Found a luxury resort in Maldives for half the price. The whole family had an unforgettable experience. Thank you HoP!",
      destination: "Maldives",
      date: "October 2024"
    },
    {
      id: 4,
      name: "David Kim",
      location: "Seoul, South Korea",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      text: "As a frequent traveler, I can confidently say HoP offers the best deals and most reliable service. The mobile app is super smooth and fast. Love it!",
      destination: "Tokyo, Japan",
      date: "November 2024"
    }
  ];

  // Stats Data
  const stats = [
    { number: 2500000, label: "Happy Travelers", suffix: "+", icon: <Users size={40} color="#10b981" /> },
    { number: 50000, label: "Destinations Worldwide", suffix: "+", icon: <MapPin size={40} color="#10b981" /> },
    { number: 4.8, label: "Average Rating", suffix: "/5", icon: <Star size={40} color="#10b981" /> },
    { number: 1000000, label: "Bookings This Year", suffix: "+", icon: <Award size={40} color="#10b981" /> }
  ];

  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleSearch = () => {
    if (selectedLocation) navigate('/hotels');
  };

  // Animated Counter Hook
  const useCountUp = (end, duration = 2000, start = 0) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
      if (!statsAnimated) return;

      let startTime;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
        setCount(Math.floor(start + (end - start) * easeOutQuart));

        if (percentage < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }, [statsAnimated, end, duration, start]);

    return count;
  };

  // Newsletter Submit Handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 3000);
      return;
    }

    setNewsletterStatus('loading');

    // TODO: Connect to actual backend endpoint
    setTimeout(() => {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 5000);
    }, 1500);
  };

  // Testimonial Auto-Rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const getTransportIcon = (type) => {
    switch(type) {
      case 'plane': return <PlaneIcon size={18} />;
      case 'train': return <Train size={18} />;
      case 'bus': return <Bus size={18} />;
      default: return null;
    }
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: darkMode ? '#000000' : '#fafafa',
      opacity: isPageLoaded ? 1 : 0,
      transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
    }} className={darkMode ? 'dark-mode' : ''} key={`mode-${darkMode}`}>
      {/* Cursor Spotlight in Dark Mode - REMOVED THE BLACK CIRCLE */}

      <section style={{
        ...styles.hero,
        background: darkMode
          ? 'radial-gradient(ellipse at top, #0a0a1a 0%, #050510 50%, #000000 100%)'
          : 'linear-gradient(to bottom, #a8d5e2 0%, #b8dfe8 20%, #d4e9f2 50%, #e8f4f8 80%, #f5f9fc 100%)'
      }} key={`hero-${darkMode}`}>
        {/* Photorealistic Sky Background with Layered Clouds (Light Mode Only) */}
        {!darkMode && (
        <div className="photorealistic-sky" style={styles.skyBackground}>
          {/* Cirrus clouds - high altitude, wispy */}
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

          {/* Cumulus clouds - mid altitude, fluffy */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`cumulus-${i}`}
              className="cumulus-cloud"
              style={{
                position: 'absolute',
                left: `${(i * 18) % 95}%`,
                top: `${35 + (i % 2) * 15}%`,
                width: `${300 + i * 40}px`,
                height: `${120 + i * 20}px`,
              }}
            >
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: `radial-gradient(ellipse at 50% 60%, rgba(255, 255, 255, ${0.85 - i * 0.08}) 0%, rgba(250, 250, 252, ${0.6 - i * 0.08}) 40%, transparent 75%)`,
                borderRadius: '50%',
                filter: 'blur(8px)',
                opacity: 0.7,
              }} />
              <div style={{
                position: 'absolute',
                left: '25%',
                top: '-20%',
                width: '60%',
                height: '80%',
                background: `radial-gradient(ellipse, rgba(255, 255, 255, ${0.9 - i * 0.08}) 0%, rgba(248, 249, 252, ${0.5 - i * 0.08}) 50%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(6px)',
              }} />
            </div>
          ))}

          {/* Volumetric sunlight rays */}
          <div className="sunlight-rays" style={styles.sunlightRays}>
            {[...Array(5)].map((_, i) => (
              <div
                key={`ray-${i}`}
                style={{
                  position: 'absolute',
                  left: `${20 + i * 15}%`,
                  top: '-10%',
                  width: '2px',
                  height: '60%',
                  background: `linear-gradient(to bottom, rgba(255, 248, 220, ${0.15 - i * 0.02}), transparent)`,
                  transform: `rotate(${-5 + i * 2}deg)`,
                  filter: 'blur(3px)',
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        </div>
        )}

        {/* Horizontal Shooting Stars (Dark Mode Only) */}
        {darkMode && (
          <div className="shooting-stars-container" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 5,
          }}>
            {/* Star 1 - Left to Right */}
            <div className="shooting-star-wrapper shooting-star-1" style={{
              position: 'absolute',
              top: '15%',
              left: '-100px',
              animation: 'shootLeftToRight1 8s ease-in-out infinite',
            }}>
              <div className="star-glow-trail" style={{
                position: 'absolute',
                width: '120px',
                height: '3px',
                background: 'linear-gradient(to right, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))',
                right: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                filter: 'blur(4px)',
              }}></div>
              <div className="shooting-star" style={{
                fontSize: '2.5rem',
                color: '#FFD700',
                textShadow: '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.6)',
              }}>★</div>
            </div>

            {/* Star 2 - Right to Left */}
            <div className="shooting-star-wrapper shooting-star-2" style={{
              position: 'absolute',
              top: '35%',
              right: '-100px',
              animation: 'shootRightToLeft1 10s ease-in-out 1.5s infinite',
            }}>
              <div className="star-glow-trail" style={{
                position: 'absolute',
                width: '150px',
                height: '3px',
                background: 'linear-gradient(to left, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))',
                left: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                filter: 'blur(4px)',
              }}></div>
              <div className="shooting-star" style={{
                fontSize: '3rem',
                color: '#FFD700',
                textShadow: '0 0 25px rgba(255, 215, 0, 1), 0 0 50px rgba(255, 215, 0, 0.6)',
              }}>★</div>
            </div>

            {/* Star 3 - Left to Right */}
            <div className="shooting-star-wrapper shooting-star-3" style={{
              position: 'absolute',
              top: '55%',
              left: '-100px',
              animation: 'shootLeftToRight2 12s ease-in-out 3s infinite',
            }}>
              <div className="star-glow-trail" style={{
                position: 'absolute',
                width: '100px',
                height: '3px',
                background: 'linear-gradient(to right, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))',
                right: '35px',
                top: '50%',
                transform: 'translateY(-50%)',
                filter: 'blur(4px)',
              }}></div>
              <div className="shooting-star" style={{
                fontSize: '2rem',
                color: '#FFD700',
                textShadow: '0 0 18px rgba(255, 215, 0, 1), 0 0 35px rgba(255, 215, 0, 0.6)',
              }}>★</div>
            </div>

            {/* Star 4 - Right to Left */}
            <div className="shooting-star-wrapper shooting-star-4" style={{
              position: 'absolute',
              top: '70%',
              right: '-100px',
              animation: 'shootRightToLeft2 9s ease-in-out 4.5s infinite',
            }}>
              <div className="star-glow-trail" style={{
                position: 'absolute',
                width: '130px',
                height: '3px',
                background: 'linear-gradient(to left, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))',
                left: '38px',
                top: '50%',
                transform: 'translateY(-50%)',
                filter: 'blur(4px)',
              }}></div>
              <div className="shooting-star" style={{
                fontSize: '2.8rem',
                color: '#FFD700',
                textShadow: '0 0 22px rgba(255, 215, 0, 1), 0 0 44px rgba(255, 215, 0, 0.6)',
              }}>★</div>
            </div>

            {/* Star 5 - Left to Right */}
            <div className="shooting-star-wrapper shooting-star-5" style={{
              position: 'absolute',
              top: '25%',
              left: '-100px',
              animation: 'shootLeftToRight3 11s ease-in-out 6s infinite',
            }}>
              <div className="star-glow-trail" style={{
                position: 'absolute',
                width: '140px',
                height: '3px',
                background: 'linear-gradient(to right, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))',
                right: '42px',
                top: '50%',
                transform: 'translateY(-50%)',
                filter: 'blur(4px)',
              }}></div>
              <div className="shooting-star" style={{
                fontSize: '2.3rem',
                color: '#FFD700',
                textShadow: '0 0 19px rgba(255, 215, 0, 1), 0 0 38px rgba(255, 215, 0, 0.6)',
              }}>★</div>
            </div>

            {/* Star 6 - Right to Left */}
            <div className="shooting-star-wrapper shooting-star-6" style={{
              position: 'absolute',
              top: '45%',
              right: '-100px',
              animation: 'shootRightToLeft3 13s ease-in-out 7.5s infinite',
            }}>
              <div className="star-glow-trail" style={{
                position: 'absolute',
                width: '110px',
                height: '3px',
                background: 'linear-gradient(to left, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.2))',
                left: '36px',
                top: '50%',
                transform: 'translateY(-50%)',
                filter: 'blur(4px)',
              }}></div>
              <div className="shooting-star" style={{
                fontSize: '2.6rem',
                color: '#FFD700',
                textShadow: '0 0 21px rgba(255, 215, 0, 1), 0 0 42px rgba(255, 215, 0, 0.6)',
              }}>★</div>
            </div>
          </div>
        )}

        <div style={styles.heroContent}>
          <div style={styles.badgeContainer}>
            <div className="paradise-badge" style={styles.badge}>
              ✨ Discover Your Next Adventure
            </div>
          </div>

          {/* Epic 3D Animated Title - FIXED GLOW */}
          <div className="paradise-title-container" style={styles.titleContainer}>
            <h1 className="paradise-title" style={styles.paradiseTitle}>
              <span className="word-line">House of</span>
              <span className="word-paradise">
                Paradise
                {/* Paradise glow - contained within Paradise word only */}
                <span className="paradise-glow-contained"></span>
              </span>
            </h1>

            {/* Paradise particles - only around Paradise word */}
            <div className="paradise-particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="particle" style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${40 + Math.random() * 30}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}></div>
              ))}
            </div>
          </div>

          <p style={styles.heroSubtitle}>
            Experience <span className="luxury-word">luxury</span> travel like never before
          </p>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <div style={styles.searchBar} className="spotlight-card">
              <div
                style={styles.searchItem}
                onClick={() => setShowLocationModal(true)}
                className="clickable search-hover"
              >
                <div style={styles.searchIcon}>
                  <MapPin size={20} color="#10b981" />
                </div>
                <div style={styles.searchItemContent}>
                  <span style={styles.searchLabel}>LOCATION</span>
                  <span style={styles.searchValue}>
                    {selectedLocation || 'Where to?'}
                  </span>
                </div>
              </div>

              <div style={styles.searchDivider}></div>

              <div
                style={styles.searchItem}
                onClick={() => setShowDateModal(true)}
                className="clickable search-hover"
              >
                <div style={styles.searchIcon}>
                  <Calendar size={20} color="#10b981" />
                </div>
                <div style={styles.searchItemContent}>
                  <span style={styles.searchLabel}>DATE</span>
                  <span style={styles.searchValue}>
                    {selectedDate ? selectedDate.toLocaleDateString() : 'When?'}
                  </span>
                </div>
              </div>

              <div style={styles.searchDivider}></div>

              <div
                style={styles.searchItem}
                onClick={() => setShowPassengerModal(true)}
                className="clickable search-hover"
              >
                <div style={styles.searchIcon}>
                  <Users size={20} color="#10b981" />
                </div>
                <div style={styles.searchItemContent}>
                  <span style={styles.searchLabel}>TRAVELERS</span>
                  <span style={styles.searchValue}>
                    {passengers.adults + passengers.children} Guest{passengers.adults + passengers.children !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <button style={styles.searchButton} onClick={handleSearch} className="clickable search-btn-glow">
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 1: FEATURED DEALS ==================== */}
      <section style={{
        ...styles.featuredDealsSection,
        background: darkMode ? '#0a0a0a' : '#ffffff'
      }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div className="scroll-reveal" style={styles.sectionTitleContainer}>
              <Zap size={32} color="#10b981" style={{ marginRight: '12px' }} />
              <h2 style={{
                ...styles.sectionTitle,
                color: darkMode ? '#ffffff' : '#1f2937'
              }}>
                Hot Deals This Week
              </h2>
            </div>
            <p className="scroll-reveal" style={{
              ...styles.sectionSubtitle,
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              Limited time offers - Book now and save big!
            </p>
          </div>

          <div style={styles.dealsGrid}>
            {/* Deal Card 1 - Flash Sale */}
            <div className="scroll-reveal spotlight-card" style={{
              ...styles.dealCard,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb'
            }}>
              <div style={styles.dealBadge}>
                <Sparkles size={16} />
                <span>FLASH SALE</span>
              </div>
              <div style={styles.dealTimer}>
                <Clock size={14} />
                <span>Ends in 23:45:12</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=400&fit=crop"
                alt="Maldives Paradise"
                style={styles.dealImage}
                loading="lazy"
              />

              <div style={styles.dealContent}>
                <h3 style={{
                  ...styles.dealTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Maldives Paradise Package
                </h3>
                <p style={{
                  ...styles.dealDescription,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  7 nights luxury resort + flights + breakfast
                </p>

                <div style={styles.dealPricing}>
                  <div>
                    <span style={styles.dealOldPrice}>$2,499</span>
                    <span style={styles.dealNewPrice}>$1,749</span>
                  </div>
                  <div style={styles.dealDiscount}>30% OFF</div>
                </div>

                <button
                  className="clickable"
                  style={styles.dealButton}
                  onClick={() => navigate('/hotels')}
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Deal Card 2 - Early Bird */}
            <div className="scroll-reveal spotlight-card" style={{
              ...styles.dealCard,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb'
            }}>
              <div style={{...styles.dealBadge, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                <Star size={16} />
                <span>EARLY BIRD</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=400&fit=crop"
                alt="Bali Adventure"
                style={styles.dealImage}
                loading="lazy"
              />

              <div style={styles.dealContent}>
                <h3 style={{
                  ...styles.dealTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Bali Cultural Experience
                </h3>
                <p style={{
                  ...styles.dealDescription,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  5 nights boutique hotel + guided tours
                </p>

                <div style={styles.dealPricing}>
                  <div>
                    <span style={styles.dealOldPrice}>$1,299</span>
                    <span style={styles.dealNewPrice}>$949</span>
                  </div>
                  <div style={{...styles.dealDiscount, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>27% OFF</div>
                </div>

                <button
                  className="clickable"
                  style={styles.dealButton}
                  onClick={() => navigate('/hotels')}
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Deal Card 3 - Last Minute */}
            <div className="scroll-reveal spotlight-card" style={{
              ...styles.dealCard,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              border: darkMode ? '1px solid #2a2a3e' : '1px solid #e5e7eb'
            }}>
              <div style={{...styles.dealBadge, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                <Zap size={16} />
                <span>LAST MINUTE</span>
              </div>
              <div style={styles.dealTimer}>
                <Clock size={14} />
                <span>Ends in 11:23:45</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop"
                alt="Paris Getaway"
                style={styles.dealImage}
                loading="lazy"
              />

              <div style={styles.dealContent}>
                <h3 style={{
                  ...styles.dealTitle,
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Paris Weekend Escape
                </h3>
                <p style={{
                  ...styles.dealDescription,
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  3 nights central hotel + Seine cruise
                </p>

                <div style={styles.dealPricing}>
                  <div>
                    <span style={styles.dealOldPrice}>$899</span>
                    <span style={styles.dealNewPrice}>$599</span>
                  </div>
                  <div style={{...styles.dealDiscount, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>33% OFF</div>
                </div>

                <button
                  className="clickable"
                  style={styles.dealButton}
                  onClick={() => navigate('/hotels')}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: HOW IT WORKS ==================== */}
      <section style={{
        ...styles.howItWorksSection,
        background: darkMode ? '#000000' : '#f9fafb'
      }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 className="scroll-reveal" style={{
              ...styles.sectionTitle,
              color: darkMode ? '#ffffff' : '#1f2937'
            }}>
              Book Your Dream Trip in 3 Simple Steps
            </h2>
            <p className="scroll-reveal" style={{
              ...styles.sectionSubtitle,
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              Your journey to paradise starts here
            </p>
          </div>

          <div style={styles.stepsContainer}>
            {/* Step 1 */}
            <div className="scroll-reveal spotlight-card" style={{
              ...styles.stepCard,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: darkMode ? '2px solid #2a2a3e' : '2px solid #d1fae5'
            }}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepIcon}>
                <Search size={40} color="#10b981" />
              </div>
              <h3 style={{
                ...styles.stepTitle,
                color: darkMode ? '#ffffff' : '#1f2937'
              }}>
                Search & Discover
              </h3>
              <p style={{
                ...styles.stepDescription,
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Find your perfect destination with our smart search filters. Browse thousands of hotels, flights, and activities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="scroll-reveal spotlight-card" style={{
              ...styles.stepCard,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: darkMode ? '2px solid #2a2a3e' : '2px solid #d1fae5'
            }}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepIcon}>
                <Target size={40} color="#10b981" />
              </div>
              <h3 style={{
                ...styles.stepTitle,
                color: darkMode ? '#ffffff' : '#1f2937'
              }}>
                Compare & Choose
              </h3>
              <p style={{
                ...styles.stepDescription,
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Compare prices, read reviews, and find the best deals. We guarantee the lowest prices with our price match promise.
              </p>
            </div>

            {/* Step 3 */}
            <div className="scroll-reveal spotlight-card" style={{
              ...styles.stepCard,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: darkMode ? '2px solid #2a2a3e' : '2px solid #d1fae5'
            }}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepIcon}>
                <CheckCircle size={40} color="#10b981" />
              </div>
              <h3 style={{
                ...styles.stepTitle,
                color: darkMode ? '#ffffff' : '#1f2937'
              }}>
                Book with Confidence
              </h3>
              <p style={{
                ...styles.stepDescription,
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Secure booking with instant confirmation. 24/7 customer support and flexible cancellation options available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 3: CUSTOMER TESTIMONIALS ==================== */}
      <section style={{
        ...styles.testimonialsSection,
        background: darkMode ? '#0a0a0a' : '#ffffff'
      }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 className="scroll-reveal" style={{
              ...styles.sectionTitle,
              color: darkMode ? '#ffffff' : '#1f2937'
            }}>
              What Our Travelers Say
            </h2>
            <p className="scroll-reveal" style={{
              ...styles.sectionSubtitle,
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              Real experiences from real travelers
            </p>
          </div>

          <div style={styles.testimonialCarousel}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="spotlight-card"
                style={{
                  ...styles.testimonialCard,
                  background: darkMode
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                  border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                  transform: index === currentTestimonial ? 'scale(1.05)' : 'scale(0.95)',
                  opacity: index === currentTestimonial ? 1 : 0.4,
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  pointerEvents: index === currentTestimonial ? 'auto' : 'none',
                }}
              >
                <div style={styles.testimonialHeader}>
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    style={styles.testimonialAvatar}
                  />
                  <div>
                    <h4 style={{
                      ...styles.testimonialName,
                      color: darkMode ? '#ffffff' : '#1f2937'
                    }}>
                      {testimonial.name}
                    </h4>
                    <p style={{
                      ...styles.testimonialLocation,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div style={styles.testimonialStars}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <p style={{
                  ...styles.testimonialText,
                  color: darkMode ? '#d1d5db' : '#4b5563'
                }}>
                  "{testimonial.text}"
                </p>

                <div style={styles.testimonialFooter}>
                  <span style={styles.testimonialDestination}>
                    <MapPin size={16} color="#10b981" />
                    {testimonial.destination}
                  </span>
                  <span style={{
                    ...styles.testimonialDate,
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {testimonial.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  ...styles.testimonialDot,
                  background: index === currentTestimonial
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : darkMode ? '#4b5563' : '#d1d5db'
                }}
                className="clickable"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION 4: STATS / TRUST INDICATORS ==================== */}
      <section
        style={{
          ...styles.statsSection,
          background: darkMode ? '#000000' : '#f9fafb'
        }}
        onScroll={(e) => {
          const element = e.currentTarget;
          const position = element.getBoundingClientRect();
          if (position.top < window.innerHeight && !statsAnimated) {
            setStatsAnimated(true);
          }
        }}
      >
        <div style={styles.sectionContainer}>
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const StatCounter = () => {
                const count = useCountUp(stat.number, 2500);

                return (
                  <div key={index} className="scroll-reveal spotlight-card" style={{
                    ...styles.statCard,
                    background: darkMode
                      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                    border: darkMode ? '2px solid #2a2a3e' : '2px solid #d1fae5'
                  }}
                  onMouseEnter={() => !statsAnimated && setStatsAnimated(true)}
                  >
                    <div style={styles.statIcon}>{stat.icon}</div>
                    <div style={styles.statNumber}>
                      {stat.number < 10
                        ? count.toFixed(1)
                        : count.toLocaleString()}
                      <span style={styles.statSuffix}>{stat.suffix}</span>
                    </div>
                    <div style={{
                      ...styles.statLabel,
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                );
              };

              return <StatCounter key={index} />;
            })}
          </div>
        </div>
      </section>

      {/* ==================== PERSONALIZED RECOMMENDATIONS ==================== */}
      {(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id ? <RecommendedForYou userId={user.id} /> : null;
      })()}

      {/* ==================== RECENTLY VIEWED ==================== */}
      {(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id ? <RecentlyViewed userId={user.id} /> : null;
      })()}

      {/* ==================== SECTION 5: NEWSLETTER SIGNUP ==================== */}
      <section style={{
        ...styles.newsletterSection,
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }}>
        <div style={styles.sectionContainer}>
          <div style={styles.newsletterContent}>
            <div style={styles.newsletterIcon}>
              <Mail size={48} color="white" />
            </div>

            <h2 style={styles.newsletterTitle}>
              Get Exclusive Travel Deals
            </h2>
            <p style={styles.newsletterSubtitle}>
              Subscribe to our newsletter and never miss out on amazing offers. We send only the best deals - no spam!
            </p>

            <form onSubmit={handleNewsletterSubmit} style={styles.newsletterForm}>
              <div style={styles.newsletterInputContainer}>
                <Mail size={20} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.newsletterInputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    ...styles.newsletterInput,
                    background: darkMode ? '#1e293b' : 'white',
                    color: darkMode ? '#ffffff' : '#1f2937'
                  }}
                  disabled={newsletterStatus === 'loading'}
                />
              </div>

              <button
                type="submit"
                className="clickable"
                style={{
                  ...styles.newsletterButton,
                  opacity: newsletterStatus === 'loading' ? 0.7 : 1
                }}
                disabled={newsletterStatus === 'loading'}
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>

            {newsletterStatus === 'success' && (
              <div style={styles.newsletterSuccess}>
                <CheckCircle size={20} />
                <span>Success! Check your inbox for a confirmation email.</span>
              </div>
            )}

            {newsletterStatus === 'error' && (
              <div style={styles.newsletterError}>
                <X size={20} />
                <span>Please enter a valid email address.</span>
              </div>
            )}

            <p style={styles.newsletterPrivacy}>
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>Select Location</h2>
              <button onClick={() => setShowLocationModal(false)} className="clickable modal-close">
                <X size={24} />
              </button>
            </div>
            <div style={styles.modalSearch}>
              <Search size={20} />
              <input type="text" placeholder="Search destination..." style={styles.modalInput} />
            </div>
            <div style={styles.flagGrid}>
              {destinations.map((dest, i) => (
                <div
                  key={i}
                  style={styles.flagItem}
                  onClick={() => {
                    setSelectedLocation(dest.name);
                    setShowLocationModal(false);
                  }}
                  className="clickable flag-item spotlight-card"
                >
                  <span style={styles.flag}>{dest.flag}</span>
                  <span>{dest.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>Select Date</h2>
              <button onClick={() => setShowDateModal(false)} className="clickable modal-close">
                <X size={24} />
              </button>
            </div>
            <div style={styles.calendarHeader}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="clickable cal-nav">
                <ChevronLeft />
              </button>
              <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="clickable cal-nav">
                <ChevronRight />
              </button>
            </div>
            <div style={styles.calendar}>
              <div style={styles.weekdays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div style={styles.calendarDays}>
                {generateCalendar(currentMonth).map((date, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.calendarDay,
                      ...(date && styles.calendarDayActive),
                      ...(selectedDate && date && date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelected)
                    }}
                    onClick={() => date && setSelectedDate(date)}
                    className={date ? "clickable cal-day" : ""}
                  >
                    {date ? date.getDate() : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPassengerModal && (
        <div className="modal-overlay" onClick={() => setShowPassengerModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>Passengers</h2>
              <button onClick={() => setShowPassengerModal(false)} className="clickable modal-close">
                <X size={24} />
              </button>
            </div>
            <div style={styles.passengerContent}>
              <div style={styles.passengerRow}>
                <div>
                  <div style={styles.passengerLabel}>Adults</div>
                  <div style={styles.passengerSub}>16+ years</div>
                </div>
                <div style={styles.passengerControls}>
                  <button onClick={() => setPassengers({...passengers, adults: Math.max(1, passengers.adults - 1)})} className="clickable btn-3d-small">-</button>
                  <span>{passengers.adults}</span>
                  <button onClick={() => setPassengers({...passengers, adults: passengers.adults + 1})} className="clickable btn-3d-small">+</button>
                </div>
              </div>
              <div style={styles.passengerRow}>
                <div>
                  <div style={styles.passengerLabel}>Children</div>
                  <div style={styles.passengerSub}>0-15 years</div>
                </div>
                <div style={styles.passengerControls}>
                  <button onClick={() => setPassengers({...passengers, children: Math.max(0, passengers.children - 1)})} className="clickable btn-3d-small">-</button>
                  <span>{passengers.children}</span>
                  <button onClick={() => setPassengers({...passengers, children: passengers.children + 1})} className="clickable btn-3d-small">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dark Mode Toggle - Pass to Navbar via context or prop */}
      <div style={{display: 'none'}} data-dark-mode={darkMode.toString()}></div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    transition: 'background-color 1.2s ease',
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, #a8d5e2 0%, #b8dfe8 20%, #d4e9f2 50%, #e8f4f8 80%, #f5f9fc 100%)',
    overflow: 'hidden',
    transition: 'background 1.2s ease',
    width: '100%',
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
  sunlightRays: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '0 2rem',
    maxWidth: '1200px',
    width: '100%',
    overflow: 'visible',
  },
  badgeContainer: {
    marginBottom: '3rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: 'rgba(255,255,255,0.8)',
    border: '2px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '50px',
    color: '#047857',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
  },
  titleContainer: {
    position: 'relative',
    marginBottom: '2rem',
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
    fontSize: '1.4rem',
    color: '#6b7280',
    marginBottom: '3rem',
    fontWeight: '400',
    transition: 'color 1s ease',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '16px',
    padding: '0.5rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    gap: '0.5rem',
    maxWidth: '900px',
    width: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  searchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    flex: 1,
    transition: 'all 0.2s',
  },
  searchIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  searchItemContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  searchLabel: {
    fontSize: '0.65rem',
    color: '#9ca3af',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  searchValue: {
    fontSize: '1rem',
    color: '#1f2937',
    fontWeight: '600',
    marginTop: '0.25rem',
    transition: 'color 0.3s ease',
  },
  searchDivider: {
    width: '1px',
    height: '40px',
    background: '#e5e7eb',
    transition: 'background 0.3s ease',
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  destinationsSection: {
    padding: '6rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    transition: 'background 0.3s ease',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
    opacity: 0,
    transition: 'color 0.3s ease',
  },
  sectionSubtitle: {
    fontSize: '1.2rem',
    color: '#6b7280',
    opacity: 0,
    transition: 'color 0.3s ease',
  },
  transportTabs: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  },
  transportTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontWeight: '600',
    color: '#1f2937',
    opacity: 0,
    border: '2px solid transparent',
    transition: 'all 0.3s',
    position: 'relative',
  },
  destinationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
  },
  destinationCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    opacity: 0,
    position: 'relative',
    transition: 'all 0.3s',
  },
  transportBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#10b981',
    zIndex: 2,
    backdropFilter: 'blur(10px)',
    textTransform: 'capitalize',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  imageStack: {
    position: 'relative',
    height: '250px',
    overflow: 'hidden',
  },
  stackImage1: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    transition: 'all 0.5s',
  },
  stackImage2: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    opacity: 0,
    transition: 'all 0.5s',
  },
  destinationInfo: {
    padding: '1.5rem',
    transition: 'background 0.3s ease',
  },
  destinationName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    transition: 'color 0.3s ease',
  },
  destinationDescription: {
    fontSize: '0.95rem',
    color: '#6b7280',
    marginBottom: '1rem',
    transition: 'color 0.3s ease',
  },
  destinationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationPrice: {
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  whySection: {
    padding: '6rem 2rem',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
    textAlign: 'center',
    transition: 'background 0.3s ease',
  },
  whyTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '3rem',
    opacity: 0,
    transition: 'color 0.3s ease',
  },
  whyAccent: {
    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  whyCard: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    opacity: 0,
    transition: 'all 0.3s',
    position: 'relative',
  },
  whyIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 1.5rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    transition: 'all 0.3s',
  },
  whyCardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.75rem',
    transition: 'color 0.3s ease',
  },
  whyCardText: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: 1.6,
    transition: 'color 0.3s ease',
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    transition: 'all 0.3s',
  },
  modalInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
  },
  flagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
  },
  flagItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '12px',
    transition: 'all 0.2s',
    background: '#f9fafb',
    border: '2px solid transparent',
    position: 'relative',
  },
  flag: {
    fontSize: '2.5rem',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  calendar: {
    marginBottom: '1rem',
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  calendarDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  calendarDay: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'transparent',
    transition: 'all 0.2s',
  },
  calendarDayActive: {
    color: '#1f2937',
  },
  calendarDaySelected: {
    background: '#10b981',
    color: 'white',
    fontWeight: '700',
  },
  passengerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  passengerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  passengerLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  passengerSub: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  passengerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1.2rem',
    fontWeight: '600',
  },

  // ===== NEW SECTION STYLES =====

  // Common Section Styles
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  sectionTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  sectionSubtitle: {
    fontSize: '1.15rem',
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Featured Deals Section
  featuredDealsSection: {
    padding: '6rem 0',
    transition: 'background 1.2s ease',
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  dealCard: {
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  dealBadge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
  dealTimer: {
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
  dealImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  dealContent: {
    padding: '1.5rem',
  },
  dealTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  dealDescription: {
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
  },
  dealPricing: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  dealOldPrice: {
    fontSize: '1rem',
    color: '#9ca3af',
    textDecoration: 'line-through',
    marginRight: '0.75rem',
  },
  dealNewPrice: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#10b981',
  },
  dealDiscount: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  dealButton: {
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

  // How It Works Section
  howItWorksSection: {
    padding: '6rem 0',
    transition: 'background 1.2s ease',
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  stepCard: {
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.4s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  stepNumber: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '800',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
  },
  stepIcon: {
    marginBottom: '1.5rem',
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  stepDescription: {
    fontSize: '1rem',
    lineHeight: '1.6',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Custom Green Scrollbar */
    ::-webkit-scrollbar {
      width: 14px;
      height: 14px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 10px;
      border: 3px solid #f1f1f1;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }

    * {
      scrollbar-width: thin;
      scrollbar-color: #10b981 #f1f1f1;
    }

    /* Dark Mode Scrollbar */
    .dark-mode ::-webkit-scrollbar-track {
      background: #1a1a1a;
    }

    .dark-mode ::-webkit-scrollbar-thumb {
      border-color: #1a1a1a;
    }

    /* Epic Paradise Title - FIXED GLOW OVERFLOW */
    .paradise-title-container {
      perspective: 1000px;
      transform-style: preserve-3d;
      position: relative;
      isolation: isolate;
      overflow: visible !important;
      width: 100%;
    }

    .paradise-title {
      display: flex;
      flex-direction: column;
      transform-style: preserve-3d;
      position: relative;
      overflow: visible !important;
      width: 100%;
    }

    .word-line {
      font-size: 2.5rem;
      color: #4b5563;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
      animation: floatSlow 4s ease-in-out infinite;
      position: relative;
      z-index: 2;
    }

    .word-paradise {
      font-size: 7rem;
      font-weight: 900;
      background: linear-gradient(135deg,
        #1a1a1a 0%,
        #10b981 25%,
        #059669 50%,
        #10b981 75%,
        #1a1a1a 100%);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -3px;
      display: inline-block;
      width: auto;
      min-width: fit-content;
      overflow: visible;
      animation:
        paradiseFloat 6s ease-in-out infinite,
        paradiseRotate 20s linear infinite,
        gradientFlow 8s ease infinite;
      transform-style: preserve-3d;
      filter: drop-shadow(0 10px 30px rgba(16, 185, 129, 0.3));
      position: relative;
      z-index: 1;
      transition: background 0.5s ease, filter 0.5s ease;
    }

    /* Glow contained within Paradise word only */
    .paradise-glow-contained {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(ellipse, rgba(16, 185, 129, 0.2) 0%, transparent 60%);
      animation: glowPulse 4s ease-in-out infinite;
      pointer-events: none;
      z-index: -1;
      filter: blur(30px);
    }

    @keyframes paradiseFloat {
      0%, 100% {
        transform: translateY(0px) rotateX(0deg) rotateY(0deg);
      }
      25% {
        transform: translateY(-20px) rotateX(5deg) rotateY(-5deg);
      }
      50% {
        transform: translateY(-10px) rotateX(-3deg) rotateY(5deg);
      }
      75% {
        transform: translateY(-25px) rotateX(3deg) rotateY(-3deg);
      }
    }

    @keyframes paradiseRotate {
      0% {
        transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg);
      }
      25% {
        transform: rotateY(3deg) rotateX(2deg) rotateZ(1deg);
      }
      50% {
        transform: rotateY(0deg) rotateX(-2deg) rotateZ(-1deg);
      }
      75% {
        transform: rotateY(-3deg) rotateX(2deg) rotateZ(1deg);
      }
      100% {
        transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg);
      }
    }

    @keyframes gradientFlow {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }

    @keyframes floatSlow {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
    }

    @keyframes glowPulse {
      0%, 100% {
        opacity: 0.4;
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1.2);
      }
    }

    /* Paradise Particles */
    .paradise-particles {
      position: absolute;
      top: 30%;
      left: 0;
      width: 100%;
      height: 70%;
      pointer-events: none;
      z-index: 0;
      overflow: visible;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, #10b981 0%, transparent 70%);
      border-radius: 50%;
      animation: particleFloat 5s ease-in-out infinite;
      pointer-events: none !important;
      will-change: transform, opacity;
    }

    @keyframes particleFloat {
      0%, 100% {
        transform: translateY(0) scale(1);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      50% {
        transform: translateY(-100px) scale(1.5);
        opacity: 0.6;
      }
      90% {
        opacity: 0.3;
      }
    }

    .paradise-badge {
      animation: badgeFloat 3s ease-in-out infinite;
    }

    @keyframes badgeFloat {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    /* Cirrus Clouds - Smooth Drift */
    .cirrus-cloud {
      animation: cirrusDrift 45s ease-in-out infinite;
    }

    @keyframes cirrusDrift {
      0%, 100% {
        transform: translateX(0) translateY(0);
        opacity: 0.6;
      }
      50% {
        transform: translateX(50px) translateY(-8px);
        opacity: 0.8;
      }
    }

    /* Cumulus Clouds - Gentle Float */
    .cumulus-cloud {
      animation: cumulusFloat 60s ease-in-out infinite;
    }

    @keyframes cumulusFloat {
      0%, 100% {
        transform: translateX(0) translateY(0) scale(1);
      }
      33% {
        transform: translateX(20px) translateY(-15px) scale(1.05);
      }
      66% {
        transform: translateX(-15px) translateY(-5px) scale(0.98);
      }
    }

    /* Sunlight Rays - Subtle Fade */
    .sunlight-rays > div {
      animation: raysFade 8s ease-in-out infinite;
    }

    @keyframes raysFade {
      0%, 100% {
        opacity: 0.3;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Hide clouds in dark mode */
    .hide-in-dark {
      display: none !important;
    }

    /* Dark Mode - Complete Night Mode for Entire Page */
    .dark-mode {
      background: #000000 !important;
      transition: background 0.5s ease;
    }

    .dark-mode .App {
      background: #000000 !important;
      transition: background 0.5s ease;
    }

    /* Dark Mode Hero - Night Sky */
    .dark-mode section[style*="hero"] {
      background: radial-gradient(ellipse at top, #0a0a1a 0%, #050510 50%, #000000 100%) !important;
      transition: background 0.5s ease;
    }

    /* Dark Mode - All Sections Get Night Background */
    .dark-mode section {
      background: #0a0a0a !important;
      transition: background 0.5s ease;
    }

    /* ============================
       HORIZONTAL SHOOTING STARS WITH GLOWING TRAILS
       ============================
       Stars moving left-to-right and right-to-left with realistic motion
    */

    /* Left to Right Animations */
    @keyframes shootLeftToRight1 {
      0% {
        left: -100px;
        opacity: 0;
        transform: rotate(0deg) scale(0.8);
      }
      10% {
        opacity: 1;
        transform: rotate(15deg) scale(1);
      }
      50% {
        opacity: 1;
        transform: rotate(-5deg) scale(1.1);
      }
      90% {
        opacity: 1;
        transform: rotate(10deg) scale(1);
      }
      100% {
        left: calc(100% + 100px);
        opacity: 0;
        transform: rotate(0deg) scale(0.8);
      }
    }

    @keyframes shootLeftToRight2 {
      0% {
        left: -100px;
        opacity: 0;
        transform: rotate(0deg) scale(0.9);
      }
      8% {
        opacity: 1;
        transform: rotate(-20deg) scale(1);
      }
      45% {
        opacity: 1;
        transform: rotate(8deg) scale(1.05);
      }
      92% {
        opacity: 1;
        transform: rotate(-12deg) scale(1);
      }
      100% {
        left: calc(100% + 100px);
        opacity: 0;
        transform: rotate(0deg) scale(0.9);
      }
    }

    @keyframes shootLeftToRight3 {
      0% {
        left: -100px;
        opacity: 0;
        transform: rotate(0deg) scale(0.85);
      }
      12% {
        opacity: 1;
        transform: rotate(18deg) scale(1);
      }
      52% {
        opacity: 1;
        transform: rotate(-10deg) scale(1.08);
      }
      88% {
        opacity: 1;
        transform: rotate(14deg) scale(1);
      }
      100% {
        left: calc(100% + 100px);
        opacity: 0;
        transform: rotate(0deg) scale(0.85);
      }
    }

    /* Right to Left Animations */
    @keyframes shootRightToLeft1 {
      0% {
        right: -100px;
        opacity: 0;
        transform: rotate(0deg) scale(0.8);
      }
      10% {
        opacity: 1;
        transform: rotate(-15deg) scale(1);
      }
      50% {
        opacity: 1;
        transform: rotate(5deg) scale(1.1);
      }
      90% {
        opacity: 1;
        transform: rotate(-10deg) scale(1);
      }
      100% {
        right: calc(100% + 100px);
        opacity: 0;
        transform: rotate(0deg) scale(0.8);
      }
    }

    @keyframes shootRightToLeft2 {
      0% {
        right: -100px;
        opacity: 0;
        transform: rotate(0deg) scale(0.9);
      }
      8% {
        opacity: 1;
        transform: rotate(20deg) scale(1);
      }
      45% {
        opacity: 1;
        transform: rotate(-8deg) scale(1.05);
      }
      92% {
        opacity: 1;
        transform: rotate(12deg) scale(1);
      }
      100% {
        right: calc(100% + 100px);
        opacity: 0;
        transform: rotate(0deg) scale(0.9);
      }
    }

    @keyframes shootRightToLeft3 {
      0% {
        right: -100px;
        opacity: 0;
        transform: rotate(0deg) scale(0.85);
      }
      12% {
        opacity: 1;
        transform: rotate(-18deg) scale(1);
      }
      52% {
        opacity: 1;
        transform: rotate(10deg) scale(1.08);
      }
      88% {
        opacity: 1;
        transform: rotate(-14deg) scale(1);
      }
      100% {
        right: calc(100% + 100px);
        opacity: 0;
        transform: rotate(0deg) scale(0.85);
      }
    }

    /* Luxury Word Golden Glow Effect */
    .luxury-word {
      position: relative;
      display: inline-block;
      transition: all 0.5s ease;
      cursor: pointer;
    }

    .luxury-word:hover {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5));
      animation: luxuryPulse 2s ease-in-out infinite;
    }

    @keyframes luxuryPulse {
      0%, 100% {
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
      }
      50% {
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.7));
      }
    }

    /* Search Button Inner Glow */
    .search-btn-glow {
      position: relative;
      overflow: hidden;
    }

    .search-btn-glow::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 40%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.6s ease, height 0.6s ease;
      pointer-events: none;
    }

    .search-btn-glow:hover::before {
      width: 400px;
      height: 400px;
    }

    .search-btn-glow:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow:
        0 12px 32px rgba(16, 185, 129, 0.6),
        0 0 60px rgba(16, 185, 129, 0.4),
        inset 0 0 40px rgba(255, 255, 255, 0.2);
    }

    /* 3D Buttons */
    .btn-3d-small {
      padding: 0.5rem 1.25rem;
      borderRadius: 10px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      fontWeight: 600;
      cursor: pointer;
      transition: all 0.2s;
      boxShadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }

    .btn-3d-small:hover {
      transform: translateY(-3px) scale(1.08);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4);
    }

    /* Cards Hover */
    .transport-tab:hover {
      border-color: #10b981;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
    }

    .destination-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    }

    .destination-card:hover .stack-img-1 {
      opacity: 0;
      transform: scale(1.1);
    }

    .destination-card:hover .stack-img-2 {
      opacity: 1;
      transform: scale(1.1);
    }

    .why-card:hover {
      transform: translateY(-10px) rotate(2deg) scale(1.03);
      box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2);
    }

    .why-card:hover .whyIcon {
      transform: rotateY(360deg) scale(1.15);
    }

    .search-hover:hover {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05));
      transform: translateY(-2px);
    }

    .flag-item:hover {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
      transform: translateY(-4px) scale(1.05);
      border-color: #10b981;
    }

    .cal-day:hover {
      background: #f0fdf4;
      transform: scale(1.15);
    }

    .cal-nav:hover {
      background: #f0fdf4;
      transform: scale(1.1);
    }

    .modal-close:hover {
      background: #fee2e2;
      color: #dc2626;
      transform: rotate(90deg) scale(1.1);
    }

    .modalSearch:focus-within {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .scroll-reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }

    .scroll-reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* DARK MODE STYLES - Complete Night Mode with Smooth Transitions */
    .dark-mode {
      background-color: #000000 !important;
      transition: background-color 1.2s ease !important;
    }

    .dark-mode > div {
      background-color: #000000 !important;
      transition: background-color 1.2s ease !important;
    }

    .dark-mode .hero {
      background: radial-gradient(ellipse at top, #1a1a1a 0%, #0f0f0f 50%, #0a0a0a 100%) !important;
      transition: background 1.2s ease !important;
    }

    .dark-mode .badge {
      background: rgba(16, 185, 129, 0.1) !important;
      border-color: rgba(16, 185, 129, 0.5) !important;
      color: #10b981 !important;
      transition: all 1s ease !important;
    }

    .dark-mode .word-line {
      color: #9ca3af !important;
      transition: color 1s ease !important;
    }

    .dark-mode .word-paradise {
      background: linear-gradient(135deg,
        #ffffff 0%,
        #10b981 25%,
        #059669 50%,
        #10b981 75%,
        #ffffff 100%) !important;
      background-size: 300% 300% !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      filter: drop-shadow(0 10px 30px rgba(16, 185, 129, 0.5)) !important;
      transition: all 1s ease !important;
    }

    .dark-mode .heroSubtitle {
      color: #9ca3af !important;
      transition: color 1s ease !important;
    }

    .dark-mode .searchBar {
      background: #1f2937 !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
      transition: all 1s ease !important;
    }

    .dark-mode .searchIcon {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.3)) !important;
      transition: background 1s ease !important;
    }

    .dark-mode .searchLabel {
      color: #6b7280 !important;
      transition: color 1s ease !important;
    }

    .dark-mode .searchValue {
      color: #e5e7eb !important;
      transition: color 1s ease !important;
    }

    .dark-mode .searchDivider {
      background: #374151 !important;
      transition: background 1s ease !important;
    }

    .dark-mode .destinationsSection {
      background: #0a0a0a !important;
      transition: background 1.2s ease !important;
    }

    .dark-mode .sectionTitle {
      color: #f9fafb !important;
      transition: color 1s ease !important;
    }

    .dark-mode .sectionSubtitle {
      color: #9ca3af !important;
      transition: color 1s ease !important;
    }

    .dark-mode .transportTab {
      background: #1f2937 !important;
      color: #e5e7eb !important;
      transition: all 1s ease !important;
    }

    .dark-mode .destinationCard {
      background: #1f2937 !important;
      transition: background 1s ease !important;
    }

    .dark-mode .destinationInfo {
      background: #1f2937 !important;
      transition: background 1s ease !important;
    }

    .dark-mode .destinationName {
      color: #f9fafb !important;
      transition: color 1s ease !important;
    }

    .dark-mode .destinationDescription {
      color: #9ca3af !important;
      transition: color 1s ease !important;
    }

    .dark-mode .whySection {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%) !important;
      transition: background 1.2s ease !important;
    }

    .dark-mode .whyTitle {
      color: #f9fafb !important;
      transition: color 1s ease !important;
    }

    .dark-mode .whyCard {
      background: #1f2937 !important;
      transition: background 1s ease !important;
    }

    .dark-mode .whyCardTitle {
      color: #f9fafb !important;
      transition: color 1s ease !important;
    }

    .dark-mode .whyCardText {
      color: #9ca3af !important;
      transition: color 1s ease !important;
    }

    .dark-mode .modal {
      background: #1f2937 !important;
      color: #e5e7eb !important;
      transition: all 1s ease !important;
    }

    .dark-mode .flagItem {
      background: #111827 !important;
      transition: background 1s ease !important;
    }

    /* Cursor spotlight removed - no more black circle */

    /* Card Spotlight Effect */
    .dark-mode .spotlight-card {
      position: relative;
      overflow: hidden;
    }

    .dark-mode .spotlight-card::before {
      content: '';
      position: absolute;
      top: var(--mouse-y, 50%);
      left: var(--mouse-x, 50%);
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%);
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 1;
    }

    .dark-mode .spotlight-card:hover::before {
      opacity: 1;
    }

    /* Border Glow Effect - responsive to cursor position */
    .dark-mode .spotlight-card:hover {
      box-shadow:
        0 0 20px rgba(16, 185, 129, 0.3),
        0 0 40px rgba(16, 185, 129, 0.2),
        0 4px 16px rgba(0, 0, 0, 0.4);
      border-color: rgba(16, 185, 129, 0.5) !important;
    }

    .dark-mode .spotlight-card::after {
      content: '';
      position: absolute;
      top: var(--mouse-y, 50%);
      left: var(--mouse-x, 50%);
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: -1;
      filter: blur(20px);
    }

    .dark-mode .spotlight-card:hover::after {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .word-paradise { font-size: 4rem !important; }
      .word-line { font-size: 2rem !important; }
      .searchBar { flex-direction: column; }
      .searchDivider { display: none; }
    }
  `;
  document.head.appendChild(style);

  // Add mouse tracking for card spotlight
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

export default Home;
