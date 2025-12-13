import React, { useState } from 'react';
import { Users, MapPin, Star, Award } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { stats } from '../../data/testimonials';

const Stats = ({ darkMode }) => {
  const [statsAnimated, setStatsAnimated] = useState(false);

  const getIcon = (iconName) => {
    const icons = {
      users: <Users size={40} color="#10b981" />,
      'map-pin': <MapPin size={40} color="#10b981" />,
      star: <Star size={40} color="#10b981" />,
      award: <Award size={40} color="#10b981" />,
    };
    return icons[iconName] || <Award size={40} color="#10b981" />;
  };

  const StatCard = ({ stat }) => {
    const count = useCountUp(stat.number, 2500, 0, statsAnimated);

    return (
      <div
        className="scroll-reveal spotlight-card hover-lift"
        style={{
          ...styles.card,
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: darkMode ? '2px solid #2a2a3e' : '2px solid #d1fae5',
        }}
        onMouseEnter={() => !statsAnimated && setStatsAnimated(true)}
      >
        <div style={styles.icon}>{getIcon(stat.icon)}</div>
        <div style={styles.number}>
          {stat.number < 10 ? count.toFixed(1) : count.toLocaleString()}
          <span style={styles.suffix}>{stat.suffix}</span>
        </div>
        <div
          style={{
            ...styles.label,
            color: darkMode ? '#9ca3af' : '#6b7280',
          }}
        >
          {stat.label}
        </div>
      </div>
    );
  };

  return (
    <section
      style={{
        ...styles.section,
        background: darkMode ? '#000000' : '#f9fafb',
      }}
    >
      <div style={styles.container}>
        <div style={styles.grid}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  card: {
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    transition: 'all 0.4s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  icon: {
    marginBottom: '1rem',
  },
  number: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  suffix: {
    fontSize: '1.5rem',
    marginLeft: '0.25rem',
    marginTop: '0.5rem',
  },
  label: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
};

export default Stats;
