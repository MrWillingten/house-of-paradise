import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';

const WishlistButton = ({ hotelId, userId, size = 'medium' }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [hotelId, userId]);

  const checkWishlistStatus = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/personalization/wishlist/${userId}`
      );
      const wishlist = response.data.data;
      const isInWishlist = wishlist.some(item => item.hotel._id === hotelId);
      setIsSaved(isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (!userId) {
      alert('Please log in to save hotels to your wishlist');
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        await axios.delete('http://localhost:3001/api/personalization/wishlist/remove', {
          data: { userId, hotelId }
        });
        setIsSaved(false);
      } else {
        await axios.post('http://localhost:3001/api/personalization/wishlist/add', {
          userId,
          hotelId
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 40;
      case 'large':
        return 48;
      default:
        return 40;
    }
  };

  const buttonSize = getSize();
  const iconSize = buttonSize === 32 ? 16 : buttonSize === 40 ? 20 : 24;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        ...styles.button,
        width: buttonSize,
        height: buttonSize,
        background: isSaved
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'rgba(255, 255, 255, 0.95)',
        border: isSaved ? 'none' : '2px solid #e5e7eb',
        color: isSaved ? 'white' : '#6b7280'
      }}
      className="wishlist-btn"
      title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={iconSize}
        fill={isSaved ? 'white' : 'transparent'}
        style={{ transition: 'all 0.3s' }}
      />
    </button>
  );
};

const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(10px)',
  },
};

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .wishlist-btn:hover:not(:disabled) {
      transform: scale(1.15);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }

    .wishlist-btn:active {
      transform: scale(0.95);
    }

    .wishlist-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}

export default WishlistButton;
