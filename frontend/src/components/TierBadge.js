import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Medal, Award, Trophy, Crown, Sparkles } from 'lucide-react';

function TierBadge({ userId }) {
  const navigate = useNavigate();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchLoyaltyData();
    }
  }, [userId]);

  // Listen for loyalty points updates (after booking completion)
  useEffect(() => {
    const handleLoyaltyUpdate = () => {
      if (userId) {
        fetchLoyaltyData();
      }
    };

    window.addEventListener('loyaltyPointsUpdated', handleLoyaltyUpdate);

    return () => {
      window.removeEventListener('loyaltyPointsUpdated', handleLoyaltyUpdate);
    };
  }, [userId]);

  const fetchLoyaltyData = async () => {
    try {
      const response = await api.get(`/api/loyalty/profile/${userId}`);
      if (response.data.success) {
        setLoyaltyData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      EXPLORER: '#CD7F32',
      ADVENTURER: '#C0C0C0',
      GLOBETROTTER: '#FFD700',
      ELITE: '#E5E4E2'
    };
    return colors[tier] || '#CD7F32';
  };

  const getTierIcon = (tier) => {
    const icons = {
      EXPLORER: Medal,
      ADVENTURER: Award,
      GLOBETROTTER: Trophy,
      ELITE: Crown
    };
    return icons[tier] || Medal;
  };

  if (loading || !loyaltyData) {
    return null;
  }

  const TierIcon = getTierIcon(loyaltyData.currentTier);
  const tierColor = getTierColor(loyaltyData.currentTier);

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      backgroundColor: tierColor + '15',
      borderRadius: '30px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `2px solid ${tierColor}40`,
      position: 'relative',
      overflow: 'hidden'
    },
    tierIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: tierColor + '25',
      position: 'relative',
      zIndex: 1
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      position: 'relative',
      zIndex: 1
    },
    tier: {
      fontSize: '13px',
      fontWeight: '700',
      color: tierColor,
      lineHeight: '1',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    points: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: '1'
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      animation: 'shimmer 3s infinite'
    }
  };

  return (
    <div
      style={styles.container}
      onClick={() => navigate('/loyalty')}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 20px #10b98140';
        e.currentTarget.style.borderColor = '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${tierColor}40`;
      }}
    >
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>
      <div style={styles.shimmer} />
      <div style={styles.tierIcon}>
        <TierIcon size={18} color={tierColor} />
      </div>
      <div style={styles.content}>
        <div style={styles.tier}>
          {loyaltyData.tierBenefits?.name || 'Explorer'}
        </div>
        <div style={styles.points}>
          <Sparkles size={12} />
          {loyaltyData.availablePoints?.toLocaleString() || '0'} pts
        </div>
      </div>
    </div>
  );
}

export default TierBadge;
