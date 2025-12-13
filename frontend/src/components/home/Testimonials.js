import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import axios from 'axios';

const Testimonials = ({ darkMode }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/testimonials/featured?limit=4');
        if (response.data.success && response.data.data.length > 0) {
          setTestimonials(response.data.data);
        } else {
          // If no reviews yet, show a message
          setTestimonials([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Generateavatar based on username
  const generateAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=150`;
  };

  if (loading) {
    return (
      <section
        style={{
          ...styles.section,
          background: darkMode ? '#0a0a0a' : '#ffffff',
        }}
      >
        <div style={styles.container}>
          <div style={styles.header}>
            <h2
              className="scroll-reveal"
              style={{
                ...styles.title,
                color: darkMode ? '#ffffff' : '#1f2937',
              }}
            >
              What Our Travelers Say
            </h2>
            <p
              className="scroll-reveal"
              style={{
                ...styles.subtitle,
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section
        style={{
          ...styles.section,
          background: darkMode ? '#0a0a0a' : '#ffffff',
        }}
      >
        <div style={styles.container}>
          <div style={styles.header}>
            <h2
              className="scroll-reveal"
              style={{
                ...styles.title,
                color: darkMode ? '#ffffff' : '#1f2937',
              }}
            >
              What Our Travelers Say
            </h2>
            <p
              className="scroll-reveal"
              style={{
                ...styles.subtitle,
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Be the first to share your travel experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        ...styles.section,
        background: darkMode ? '#0a0a0a' : '#ffffff',
      }}
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h2
            className="scroll-reveal"
            style={{
              ...styles.title,
              color: darkMode ? '#ffffff' : '#1f2937',
            }}
          >
            What Our Travelers Say
          </h2>
          <p
            className="scroll-reveal"
            style={{
              ...styles.subtitle,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            Real experiences from real travelers
          </p>
        </div>

        <div style={styles.carousel}>
          {testimonials.map((testimonial, index) => {
            // FIX: Calculate display state for each card
            const isActive = index === currentTestimonial;

            // Only show active card fully, hide others completely
            const cardStyle = {
              ...styles.card,
              background: darkMode
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
              transform: isActive ? 'scale(1)' : 'scale(0.95)',
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: isActive ? 'auto' : 'none',
            };

            return (
              <div key={testimonial._id} className="spotlight-card" style={cardStyle}>
                <div style={styles.cardHeader}>
                  <img
                    src={generateAvatar(testimonial.userName)}
                    alt={testimonial.userName}
                    style={styles.avatar}
                  />
                  <div>
                    <h4
                      style={{
                        ...styles.name,
                        color: darkMode ? '#ffffff' : '#1f2937',
                      }}
                    >
                      {testimonial.userName}
                    </h4>
                    <p
                      style={{
                        ...styles.location,
                        color: darkMode ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {testimonial.userLocation}
                    </p>
                  </div>
                </div>

                <div style={styles.stars}>
                  {[...Array(Math.round(testimonial.overallRating))].map((_, i) => (
                    <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <h3
                  style={{
                    ...styles.reviewTitle,
                    color: darkMode ? '#ffffff' : '#1f2937',
                  }}
                >
                  {testimonial.title}
                </h3>

                <p
                  style={{
                    ...styles.text,
                    color: darkMode ? '#d1d5db' : '#4b5563',
                  }}
                >
                  "{testimonial.reviewText.substring(0, 200)}
                  {testimonial.reviewText.length > 200 ? '...' : ''}"
                </p>

                <div style={styles.footer}>
                  <span style={styles.destination}>
                    <MapPin size={16} color="#10b981" />
                    {testimonial.hotel.name}, {testimonial.hotel.location}
                  </span>
                  <span
                    style={{
                      ...styles.date,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {formatDate(testimonial.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Navigation */}
        {testimonials.length > 1 && (
          <div style={styles.dots}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  ...styles.dot,
                  background:
                    index === currentTestimonial
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : darkMode
                      ? '#4b5563'
                      : '#d1d5db',
                }}
                className="clickable"
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
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
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.15rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  carousel: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    marginBottom: '2rem',
    position: 'relative',
    minHeight: '400px',
  },
  card: {
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    gridColumn: '1',
    gridRow: '1',
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '3px solid #10b981',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  location: {
    fontSize: '0.9rem',
  },
  stars: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  reviewTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  text: {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  destination: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#10b981',
  },
  date: {
    fontSize: '0.85rem',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    marginTop: '2rem',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default Testimonials;
