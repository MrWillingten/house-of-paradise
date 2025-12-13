import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Award, TrendingUp, Gift, Users, Star, Trophy, Target,
  ChevronRight, Copy, Check, Sparkles, Zap, Crown, Medal,
  Calendar, DollarSign, Share2, ExternalLink
} from 'lucide-react';

function Loyalty() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loyaltyProfile, setLoyaltyProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, achievements, history, rewards
  const [darkMode, setDarkMode] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return savedUser.darkMode || false;
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.id) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchLoyaltyData(currentUser.id);
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const fetchLoyaltyData = async (userId) => {
    try {
      // Fetch loyalty profile using axios with auto token refresh
      const profileRes = await api.get(`/api/loyalty/profile/${userId}`);
      if (profileRes.data.success) {
        setLoyaltyProfile(profileRes.data.data);
      }

      // Fetch achievements
      const achievementsRes = await api.get(`/api/loyalty/achievements/${userId}`);
      if (achievementsRes.data.success) {
        setAchievements(achievementsRes.data.data);
        setAllAchievements(achievementsRes.data.allAchievements);
      }

      // Fetch points history
      const historyRes = await api.get(`/api/loyalty/points-history/${userId}`);
      if (historyRes.data.success) {
        setPointsHistory(historyRes.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (loyaltyProfile?.referralCode) {
      navigator.clipboard.writeText(loyaltyProfile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: darkMode ? '#000000' : '#fafafa',
      paddingTop: '80px',
      paddingBottom: '60px'
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 20px'
    },
    header: {
      marginBottom: '40px'
    },
    title: {
      fontSize: '42px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '18px',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: '400'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    card: {
      backgroundColor: darkMode ? '#111111' : '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: darkMode
        ? '0 4px 6px rgba(16, 185, 129, 0.1)'
        : '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    tierCard: {
      background: darkMode
        ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    tierBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    },
    tierIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    tierName: {
      fontSize: '28px',
      fontWeight: '700',
      color: darkMode ? '#ffffff' : '#111827'
    },
    pointsDisplay: {
      fontSize: '48px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: darkMode ? '#1f2937' : '#e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '16px',
      marginBottom: '12px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      transition: 'width 0.5s ease',
      borderRadius: '12px'
    },
    benefitsList: {
      listStyle: 'none',
      padding: 0,
      margin: '20px 0 0 0'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb',
      borderRadius: '8px',
      marginBottom: '8px',
      color: darkMode ? '#d1d5db' : '#374151'
    },
    tabs: {
      display: 'flex',
      gap: '12px',
      marginBottom: '32px',
      borderBottom: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb',
      overflowX: 'auto',
      paddingBottom: '12px'
    },
    tab: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: 'transparent',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    tabActive: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    achievementsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px'
    },
    achievementCard: {
      backgroundColor: darkMode ? '#111111' : '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    achievementUnlocked: {
      border: '2px solid #10b981',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },
    achievementIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      display: 'block'
    },
    achievementName: {
      fontSize: '20px',
      fontWeight: '700',
      color: darkMode ? '#ffffff' : '#111827',
      marginBottom: '8px'
    },
    achievementDesc: {
      fontSize: '14px',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '12px'
    },
    achievementPoints: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#10b981'
    },
    unlockedBadge: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    historyTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 8px'
    },
    historyRow: {
      backgroundColor: darkMode ? '#111111' : '#ffffff',
      transition: 'all 0.2s ease'
    },
    historyCell: {
      padding: '16px',
      color: darkMode ? '#d1d5db' : '#374151',
      borderTop: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb',
      borderBottom: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb'
    },
    referralCard: {
      backgroundColor: darkMode ? '#111111' : '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      border: '2px solid #10b981',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
    },
    referralCode: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb',
      padding: '16px 24px',
      borderRadius: '12px',
      marginTop: '16px',
      marginBottom: '16px'
    },
    codeText: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#10b981',
      letterSpacing: '2px',
      flex: 1
    },
    copyButton: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    }
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <Sparkles size={48} color="#10b981" />
          <p style={{color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '16px'}}>
            Loading your rewards...
          </p>
        </div>
      </div>
    );
  }

  const TierIcon = getTierIcon(loyaltyProfile?.currentTier);
  const tierColor = getTierColor(loyaltyProfile?.currentTier);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Rewards & Loyalty</h1>
          <p style={styles.subtitle}>
            Earn points, unlock achievements, and enjoy exclusive benefits
          </p>
        </div>

        {/* Top Stats Grid */}
        <div style={styles.grid}>
          {/* Tier Card */}
          <div style={{...styles.card, ...styles.tierCard}}>
            <div style={styles.tierBadge}>
              <div style={{...styles.tierIcon, backgroundColor: tierColor + '20'}}>
                <TierIcon size={28} color={tierColor} />
              </div>
              <div>
                <div style={styles.tierName}>{loyaltyProfile?.tierBenefits?.name || 'Explorer'}</div>
                <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                  Current Tier
                </div>
              </div>
            </div>

            {loyaltyProfile?.tierProgress?.nextTier && (
              <>
                <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '16px'}}>
                  Progress to {loyaltyProfile.tierProgress.nextTier}
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${loyaltyProfile.tierProgress.progressPercent || 0}%`
                  }} />
                </div>
                <div style={{fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                  {loyaltyProfile.tierProgress.bookingsNeeded} more bookings •
                  ${loyaltyProfile.tierProgress.spendNeeded?.toLocaleString()} more spend
                </div>
              </>
            )}

            <ul style={styles.benefitsList}>
              {loyaltyProfile?.tierBenefits?.benefits?.slice(0, 3).map((benefit, index) => (
                <li key={index} style={styles.benefitItem}>
                  <Check size={16} color="#10b981" />
                  <span style={{fontSize: '14px'}}>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Points Card */}
          <div style={styles.card}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <Sparkles size={24} color="#10b981" />
              <span style={{fontSize: '18px', fontWeight: '600', color: darkMode ? '#ffffff' : '#111827'}}>
                Available Points
              </span>
            </div>
            <div style={styles.pointsDisplay}>
              {loyaltyProfile?.availablePoints?.toLocaleString() || '0'}
            </div>
            <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '20px'}}>
              Lifetime: {loyaltyProfile?.lifetimePoints?.toLocaleString() || '0'} points
            </div>
            <button
              style={{
                ...styles.copyButton,
                width: '100%',
                justifyContent: 'center'
              }}
              onClick={() => setSelectedTab('rewards')}
            >
              <Gift size={18} />
              Redeem Rewards
            </button>
          </div>

          {/* Achievements Card */}
          <div style={styles.card} onClick={() => setSelectedTab('achievements')}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <Trophy size={24} color="#10b981" />
              <span style={{fontSize: '18px', fontWeight: '600', color: darkMode ? '#ffffff' : '#111827'}}>
                Achievements
              </span>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#10b981',
              marginBottom: '8px'
            }}>
              {achievements?.length || 0}/{allAchievements?.length || 14}
            </div>
            <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
              Unlocked achievements
            </div>
            <div style={{display: 'flex', gap: '4px', marginTop: '20px'}}>
              {achievements?.slice(0, 5).map((a, i) => (
                <div key={i} style={{fontSize: '24px'}}>
                  {allAchievements?.find(ach => ach.id === a.achievementId)?.icon || '🏆'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(selectedTab === 'overview' ? styles.tabActive : {})
            }}
            onClick={() => setSelectedTab('overview')}
          >
            <Award size={18} style={{display: 'inline', marginRight: '8px'}} />
            Overview
          </button>
          <button
            style={{
              ...styles.tab,
              ...(selectedTab === 'achievements' ? styles.tabActive : {})
            }}
            onClick={() => setSelectedTab('achievements')}
          >
            <Trophy size={18} style={{display: 'inline', marginRight: '8px'}} />
            Achievements
          </button>
          <button
            style={{
              ...styles.tab,
              ...(selectedTab === 'history' ? styles.tabActive : {})
            }}
            onClick={() => setSelectedTab('history')}
          >
            <Calendar size={18} style={{display: 'inline', marginRight: '8px'}} />
            History
          </button>
          <button
            style={{
              ...styles.tab,
              ...(selectedTab === 'rewards' ? styles.tabActive : {})
            }}
            onClick={() => setSelectedTab('rewards')}
          >
            <Gift size={18} style={{display: 'inline', marginRight: '8px'}} />
            Rewards
          </button>
          <button
            style={{
              ...styles.tab,
              ...(selectedTab === 'referral' ? styles.tabActive : {})
            }}
            onClick={() => setSelectedTab('referral')}
          >
            <Users size={18} style={{display: 'inline', marginRight: '8px'}} />
            Referrals
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827', marginBottom: '20px'}}>
              Tier Benefits
            </h2>
            <div style={styles.grid}>
              {Object.entries({
                EXPLORER: 'Explorer',
                ADVENTURER: 'Adventurer',
                GLOBETROTTER: 'Globetrotter',
                ELITE: 'Paradise Elite'
              }).map(([key, name]) => {
                const tier = loyaltyProfile?.allTiers?.[key];
                const isCurrent = loyaltyProfile?.currentTier === key;
                const TierIconType = getTierIcon(key);

                return (
                  <div key={key} style={{
                    ...styles.card,
                    border: isCurrent ? '2px solid #10b981' : styles.card.border,
                    opacity: isCurrent ? 1 : 0.7
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                      <div style={{
                        ...styles.tierIcon,
                        backgroundColor: getTierColor(key) + '20',
                        width: '40px',
                        height: '40px'
                      }}>
                        <TierIconType size={24} color={getTierColor(key)} />
                      </div>
                      <div>
                        <div style={{fontSize: '20px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827'}}>
                          {name}
                        </div>
                        {isCurrent && (
                          <div style={{fontSize: '12px', color: '#10b981', fontWeight: '600'}}>
                            CURRENT TIER
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '16px'}}>
                      {tier?.minBookings || 0}+ bookings • ${(tier?.minSpend || 0).toLocaleString()}+ spend
                    </div>
                    <div style={{fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '16px'}}>
                      {tier?.discount || 5}% Discount • {tier?.pointsMultiplier || 1}x Points
                    </div>
                    <ul style={styles.benefitsList}>
                      {tier?.benefits?.slice(0, 4).map((benefit, index) => (
                        <li key={index} style={styles.benefitItem}>
                          <Check size={14} color="#10b981" />
                          <span style={{fontSize: '13px'}}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827', marginBottom: '20px'}}>
              All Achievements ({achievements?.length || 0}/{allAchievements?.length || 14})
            </h2>
            <div style={styles.achievementsGrid}>
              {allAchievements?.map((achievement) => {
                const unlocked = achievements?.some(a => a.achievementId === achievement.id);

                return (
                  <div
                    key={achievement.id}
                    style={{
                      ...styles.achievementCard,
                      ...(unlocked ? styles.achievementUnlocked : {})
                    }}
                  >
                    {unlocked && (
                      <div style={styles.unlockedBadge}>
                        <Check size={14} />
                        Unlocked
                      </div>
                    )}
                    <span style={{
                      ...styles.achievementIcon,
                      opacity: unlocked ? 1 : 0.3
                    }}>
                      {achievement.icon}
                    </span>
                    <div style={styles.achievementName}>{achievement.name}</div>
                    <div style={styles.achievementDesc}>{achievement.desc}</div>
                    <div style={styles.achievementPoints}>
                      <Sparkles size={16} />
                      +{achievement.points} points
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'history' && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827', marginBottom: '20px'}}>
              Points History
            </h2>
            <div style={{overflowX: 'auto'}}>
              <table style={styles.historyTable}>
                <thead>
                  <tr>
                    <th style={{...styles.historyCell, fontWeight: '600', textAlign: 'left'}}>Date</th>
                    <th style={{...styles.historyCell, fontWeight: '600', textAlign: 'left'}}>Type</th>
                    <th style={{...styles.historyCell, fontWeight: '600', textAlign: 'left'}}>Reason</th>
                    <th style={{...styles.historyCell, fontWeight: '600', textAlign: 'right'}}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsHistory?.slice(0, 20).map((entry, index) => (
                    <tr key={index} style={styles.historyRow}>
                      <td style={{...styles.historyCell, borderLeft: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td style={styles.historyCell}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: entry.type === 'earned' ? '#10b98120' : entry.type === 'redeemed' ? '#ef444420' : '#f59e0b20',
                          color: entry.type === 'earned' ? '#10b981' : entry.type === 'redeemed' ? '#ef4444' : '#f59e0b'
                        }}>
                          {entry.type}
                        </span>
                      </td>
                      <td style={styles.historyCell}>{entry.reason}</td>
                      <td style={{...styles.historyCell, borderRight: darkMode ? '1px solid #1f2937' : '1px solid #e5e7eb', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', textAlign: 'right', fontWeight: '600', color: entry.amount > 0 ? '#10b981' : '#ef4444'}}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'rewards' && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827', marginBottom: '20px'}}>
              Redeem Your Points
            </h2>
            <div style={{fontSize: '16px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '32px'}}>
              You have <strong style={{color: '#10b981'}}>{loyaltyProfile?.availablePoints?.toLocaleString() || '0'}</strong> points available
            </div>
            <div style={styles.grid}>
              {[
                { points: 1000, value: '$10', desc: 'Booking discount', icon: '💵' },
                { points: 5000, value: 'Free Night', desc: 'Up to $100 value', icon: '🏨' },
                { points: 10000, value: 'Airport Transfer', desc: 'Round trip', icon: '✈️' },
                { points: 15000, value: 'Room Upgrade', desc: 'Next booking', icon: '⬆️' },
                { points: 20000, value: '$250 Voucher', desc: 'Travel credit', icon: '🎟️' },
                { points: 50000, value: 'Luxury Weekend', desc: 'Premium getaway', icon: '🌟' }
              ].map((reward, index) => {
                const canAfford = loyaltyProfile?.availablePoints >= reward.points;

                return (
                  <div key={index} style={{
                    ...styles.card,
                    opacity: canAfford ? 1 : 0.5,
                    cursor: canAfford ? 'pointer' : 'not-allowed'
                  }}>
                    <div style={{fontSize: '48px', marginBottom: '16px'}}>{reward.icon}</div>
                    <div style={{fontSize: '24px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827', marginBottom: '8px'}}>
                      {reward.value}
                    </div>
                    <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '16px'}}>
                      {reward.desc}
                    </div>
                    <div style={{fontSize: '16px', fontWeight: '600', color: '#10b981', marginBottom: '16px'}}>
                      {reward.points.toLocaleString()} points
                    </div>
                    <button
                      style={{
                        ...styles.copyButton,
                        width: '100%',
                        justifyContent: 'center',
                        opacity: canAfford ? 1 : 0.5,
                        cursor: canAfford ? 'pointer' : 'not-allowed'
                      }}
                      disabled={!canAfford}
                    >
                      Redeem Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'referral' && (
          <div>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827', marginBottom: '20px'}}>
              Refer Friends, Earn Rewards
            </h2>

            <div style={styles.referralCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <Gift size={32} color="#10b981" />
                <div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: darkMode ? '#ffffff' : '#111827'}}>
                    Your Referral Code
                  </div>
                  <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                    Share with friends to earn rewards
                  </div>
                </div>
              </div>

              <div style={styles.referralCode}>
                <div style={styles.codeText}>{loyaltyProfile?.referralCode || 'LOADING...'}</div>
                <button style={styles.copyButton} onClick={copyReferralCode}>
                  {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                  {copiedCode ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px'}}>
                <div style={{
                  padding: '20px',
                  backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '8px'}}>
                    Your friend gets
                  </div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: '#10b981'}}>
                    $25 + 1,000 pts
                  </div>
                  <div style={{fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                    Welcome bonus on signup
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '8px'}}>
                    You earn
                  </div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: '#10b981'}}>
                    $25 + 2,000 pts
                  </div>
                  <div style={{fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                    When they book their first trip
                  </div>
                </div>
              </div>

              <div style={{marginTop: '24px', padding: '20px', backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb', borderRadius: '12px'}}>
                <div style={{fontSize: '16px', fontWeight: '600', color: darkMode ? '#ffffff' : '#111827', marginBottom: '12px'}}>
                  Your Referral Stats
                </div>
                <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                  <div>
                    <div style={{fontSize: '24px', fontWeight: '700', color: '#10b981'}}>
                      {loyaltyProfile?.referralStats?.successfulBookings || 0}
                    </div>
                    <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                      Successful referrals
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '24px', fontWeight: '700', color: '#10b981'}}>
                      {loyaltyProfile?.referralStats?.totalEarned?.toLocaleString() || '0'}
                    </div>
                    <div style={{fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280'}}>
                      Points earned
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Loyalty;
