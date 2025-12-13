import React from 'react';
import { Search, Target, CheckCircle } from 'lucide-react';

const HowItWorks = ({ darkMode }) => {
  const steps = [
    {
      number: 1,
      icon: <Search size={40} color="#10b981" />,
      title: 'Search & Discover',
      description:
        'Find your perfect destination with our smart search filters. Browse thousands of hotels, flights, and activities.',
    },
    {
      number: 2,
      icon: <Target size={40} color="#10b981" />,
      title: 'Compare & Choose',
      description:
        'Compare prices, read reviews, and find the best deals. We guarantee the lowest prices with our price match promise.',
    },
    {
      number: 3,
      icon: <CheckCircle size={40} color="#10b981" />,
      title: 'Book with Confidence',
      description:
        'Secure booking with instant confirmation. 24/7 customer support and flexible cancellation options available.',
    },
  ];

  return (
    <section
      style={{
        ...styles.section,
        background: darkMode ? '#000000' : '#f9fafb',
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
            Book Your Dream Trip in 3 Simple Steps
          </h2>
          <p
            className="scroll-reveal"
            style={{
              ...styles.subtitle,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            Your journey to paradise starts here
          </p>
        </div>

        <div style={styles.stepsContainer}>
          {steps.map((step) => (
            <div
              key={step.number}
              className="scroll-reveal spotlight-card hover-rotate"
              style={{
                ...styles.stepCard,
                background: darkMode
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                border: darkMode ? '2px solid #2a2a3e' : '2px solid #d1fae5',
              }}
            >
              <div style={styles.stepNumber}>{step.number}</div>
              <div style={styles.stepIcon}>{step.icon}</div>
              <h3
                style={{
                  ...styles.stepTitle,
                  color: darkMode ? '#ffffff' : '#1f2937',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  ...styles.stepDescription,
                  color: darkMode ? '#9ca3af' : '#6b7280',
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
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
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
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

export default HowItWorks;
