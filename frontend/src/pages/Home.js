import React, { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedDeals from '../components/home/FeaturedDeals';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import Stats from '../components/home/Stats';
import Newsletter from '../components/home/Newsletter';
import RecommendedForYou from '../components/RecommendedForYou';
import RecentlyViewed from '../components/RecentlyViewed';
import '../styles/animations.css';

function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.darkMode || false;
  });
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Trigger page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll reveal observer
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

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [darkMode]);

  // Mouse tracking for card spotlight
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!user.id;

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: darkMode ? '#000000' : '#fafafa',
        opacity: isPageLoaded ? 1 : 0,
        transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
      className={darkMode ? 'dark-mode' : ''}
      key={`mode-${darkMode}`}
    >
      {/* Hero Section with Paradise Title */}
      <HeroSection darkMode={darkMode} />

      {/* Featured Deals Section */}
      <FeaturedDeals darkMode={darkMode} />

      {/* How It Works Section */}
      <HowItWorks darkMode={darkMode} />

      {/* Testimonials Section */}
      <Testimonials darkMode={darkMode} />

      {/* Stats Section */}
      <Stats darkMode={darkMode} />

      {/* Personalized Recommendations (Only for logged-in users) */}
      {isLoggedIn && <RecommendedForYou userId={user.id} />}

      {/* Recently Viewed (Only for logged-in users) */}
      {isLoggedIn && <RecentlyViewed userId={user.id} />}

      {/* Newsletter Signup */}
      <Newsletter darkMode={darkMode} />

      {/* Dark Mode Data Attribute for Navbar */}
      <div style={{ display: 'none' }} data-dark-mode={darkMode.toString()}></div>
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
};

export default Home;
