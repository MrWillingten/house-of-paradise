const mongoose = require('mongoose');

// ==================== LOYALTY PROGRAM SCHEMAS ====================

// Loyalty Tiers Configuration
const TIERS = {
  EXPLORER: {
    name: 'Explorer',
    minBookings: 0,
    minSpend: 0,
    benefits: [
      '5% discount on select properties',
      'Priority customer support',
      'Early access to flash sales',
      'Welcome bonus: 500 points'
    ],
    color: '#CD7F32',
    discount: 5,
    pointsMultiplier: 1.0
  },
  ADVENTURER: {
    name: 'Adventurer',
    minBookings: 5,
    minSpend: 2000,
    benefits: [
      '10% discount on select properties',
      'Free room upgrades (subject to availability)',
      'Late check-out',
      'Welcome drink',
      'Priority support 24/7',
      'Double points on weekends'
    ],
    color: '#C0C0C0',
    discount: 10,
    pointsMultiplier: 1.5
  },
  GLOBETROTTER: {
    name: 'Globetrotter',
    minBookings: 15,
    minSpend: 5000,
    benefits: [
      '15% discount on all properties',
      'Guaranteed room upgrade',
      'Free breakfast',
      'Late check-out until 2 PM',
      'Airport lounge access',
      'Dedicated account manager',
      'Birthday bonus: 500 points',
      'Triple points on all bookings'
    ],
    color: '#FFD700',
    discount: 15,
    pointsMultiplier: 3.0
  },
  ELITE: {
    name: 'Paradise Elite',
    minBookings: 30,
    minSpend: 10000,
    benefits: [
      '20% discount on all properties',
      'Guaranteed best room',
      'Free breakfast & dinner',
      'Flexible cancellation',
      '24h check-out',
      'Exclusive luxury properties access',
      'Concierge service',
      'Annual free night',
      'Quadruple points on all bookings'
    ],
    color: '#E5E4E2',
    discount: 20,
    pointsMultiplier: 4.0
  }
};

// User Loyalty Profile Schema
const loyaltyProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },

  // Points
  totalPoints: { type: Number, default: 500 }, // Welcome bonus
  availablePoints: { type: Number, default: 500 },
  lifetimePoints: { type: Number, default: 500 },
  pointsExpiring: [{
    amount: Number,
    expiresAt: Date
  }],

  // Current Tier
  currentTier: {
    type: String,
    enum: ['EXPLORER', 'ADVENTURER', 'GLOBETROTTER', 'ELITE'],
    default: 'EXPLORER'
  },

  // Progress to Next Tier
  tierProgress: {
    currentBookings: { type: Number, default: 0 },
    currentSpend: { type: Number, default: 0 },
    nextTier: String,
    bookingsNeeded: Number,
    spendNeeded: Number,
    progressPercent: { type: Number, default: 0 }
  },

  // Points History
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'bonus']
    },
    amount: Number,
    reason: String,
    relatedBooking: { type: String }, // Changed from ObjectId to String to support various booking ID formats
    date: { type: Date, default: Date.now },
    expiresAt: Date
  }],

  // Achievements
  achievements: [{
    achievementId: String,
    unlockedAt: { type: Date, default: Date.now },
    pointsEarned: Number
  }],

  // Streaks
  streaks: {
    currentBookingStreak: { type: Number, default: 0 },
    longestBookingStreak: { type: Number, default: 0 },
    lastBookingDate: Date
  },

  // Referrals
  referralCode: { type: String, unique: true, sparse: true },
  referralStats: {
    totalInvites: { type: Number, default: 0 },
    successfulBookings: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 }
  },
  referredBy: String, // Referral code of person who referred them

  // Metadata
  joinedAt: { type: Date, default: Date.now },
  lastTierUpdate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate tier on save
loyaltyProfileSchema.pre('save', function() {
  this.updatedAt = Date.now();

  // Determine current tier
  let newTier = 'EXPLORER';
  if (this.tierProgress.currentBookings >= 30 && this.tierProgress.currentSpend >= 10000) {
    newTier = 'ELITE';
  } else if (this.tierProgress.currentBookings >= 15 && this.tierProgress.currentSpend >= 5000) {
    newTier = 'GLOBETROTTER';
  } else if (this.tierProgress.currentBookings >= 5 && this.tierProgress.currentSpend >= 2000) {
    newTier = 'ADVENTURER';
  }

  // Update tier if changed
  if (this.currentTier !== newTier) {
    this.currentTier = newTier;
    this.lastTierUpdate = Date.now();
    console.log(`🎉 User ${this.userId} upgraded to ${newTier}!`);
  }

  // Calculate progress to next tier
  const currentTierIndex = ['EXPLORER', 'ADVENTURER', 'GLOBETROTTER', 'ELITE'].indexOf(this.currentTier);
  const nextTierKey = ['ADVENTURER', 'GLOBETROTTER', 'ELITE', null][currentTierIndex];

  if (nextTierKey) {
    const nextTier = TIERS[nextTierKey];
    this.tierProgress.nextTier = nextTier.name;
    this.tierProgress.bookingsNeeded = Math.max(0, nextTier.minBookings - this.tierProgress.currentBookings);
    this.tierProgress.spendNeeded = Math.max(0, nextTier.minSpend - this.tierProgress.currentSpend);

    // Calculate progress percentage
    const bookingProgress = (this.tierProgress.currentBookings / nextTier.minBookings) * 100;
    const spendProgress = (this.tierProgress.currentSpend / nextTier.minSpend) * 100;
    this.tierProgress.progressPercent = Math.min(Math.min(bookingProgress, spendProgress), 100);
  } else {
    // Already at max tier
    this.tierProgress.nextTier = null;
    this.tierProgress.bookingsNeeded = 0;
    this.tierProgress.spendNeeded = 0;
    this.tierProgress.progressPercent = 100;
  }
});

const LoyaltyProfile = mongoose.model('LoyaltyProfile', loyaltyProfileSchema);

// Achievement Definitions
const ACHIEVEMENTS = [
  { id: 'first_booking', name: 'First Adventure', desc: 'Complete your first booking', icon: '🎉', points: 500 },
  { id: 'early_bird', name: 'Early Bird', desc: 'Book 3 months in advance', icon: '🐦', points: 200 },
  { id: 'last_minute', name: 'Spontaneous', desc: 'Book within 24 hours', icon: '⚡', points: 200 },
  { id: 'world_traveler', name: 'World Traveler', desc: 'Visit 10 countries', icon: '🌍', points: 1000 },
  { id: 'review_master', name: 'Review Master', desc: 'Write 20 reviews', icon: '⭐', points: 1000 },
  { id: 'photo_pro', name: 'Photo Pro', desc: 'Upload 50 photos in reviews', icon: '📸', points: 500 },
  { id: 'streak_7', name: 'Loyal Traveler', desc: '7-booking streak', icon: '🔥', points: 700 },
  { id: 'big_spender', name: 'Big Spender', desc: 'Spend $10,000 lifetime', icon: '💰', points: 2000 },
  { id: 'referral_king', name: 'Referral King', desc: '10 successful referrals', icon: '👑', points: 5000 },
  { id: 'weekend_warrior', name: 'Weekend Warrior', desc: 'Book 10 weekend trips', icon: '🏖️', points: 800 },
  { id: 'business_pro', name: 'Business Pro', desc: 'Book 20 business trips', icon: '💼', points: 1500 },
  { id: 'family_first', name: 'Family First', desc: 'Book 5 family vacations', icon: '👨‍👩‍👧‍👦', points: 600 },
  { id: 'luxury_lover', name: 'Luxury Lover', desc: 'Book 5 five-star hotels', icon: '🌟', points: 1200 },
  { id: 'budget_smart', name: 'Budget Smart', desc: 'Save $1000 with deals', icon: '🤑', points: 800 }
];

// ==================== LOYALTY ENGINE ====================

class LoyaltyEngine {
  // Initialize user loyalty profile
  static async initializeProfile(userId) {
    try {
      let profile = await LoyaltyProfile.findOne({ userId });

      if (!profile) {
        // Generate unique referral code
        const referralCode = userId.substring(0, 4).toUpperCase() +
                           Math.random().toString(36).substring(2, 6).toUpperCase();

        profile = new LoyaltyProfile({
          userId,
          referralCode,
          totalPoints: 500, // Welcome bonus
          availablePoints: 500,
          lifetimePoints: 500
        });

        await profile.save();

        console.log(`🎉 Loyalty profile created for ${userId} with 500 welcome points!`);
      }

      return profile;
    } catch (error) {
      console.error('Error initializing loyalty profile:', error);
      throw error;
    }
  }

  // Award points for booking
  static async awardPointsForBooking(userId, bookingAmount, bookingId) {
    try {
      const profile = await this.initializeProfile(userId);

      // Base points: $1 = 10 points
      const basePoints = Math.floor(bookingAmount * 10);

      // Tier multiplier
      const tierConfig = TIERS[profile.currentTier];
      const multipliedPoints = Math.floor(basePoints * tierConfig.pointsMultiplier);

      // Add points
      profile.totalPoints += multipliedPoints;
      profile.availablePoints += multipliedPoints;
      profile.lifetimePoints += multipliedPoints;

      // Add to history
      profile.pointsHistory.push({
        type: 'earned',
        amount: multipliedPoints,
        reason: `Booking reward (${tierConfig.pointsMultiplier}x multiplier)`,
        relatedBooking: bookingId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
      });

      // Update tier progress
      profile.tierProgress.currentBookings += 1;
      profile.tierProgress.currentSpend += bookingAmount;

      await profile.save();

      // Check achievements
      await this.checkAchievements(userId);

      return {
        success: true,
        pointsEarned: multipliedPoints,
        newBalance: profile.availablePoints,
        tier: profile.currentTier
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Redeem points
  static async redeemPoints(userId, pointsToRedeem, reason) {
    try {
      const profile = await LoyaltyProfile.findOne({ userId });

      if (!profile) {
        return { success: false, message: 'Loyalty profile not found' };
      }

      if (profile.availablePoints < pointsToRedeem) {
        return { success: false, message: 'Insufficient points' };
      }

      // Deduct points
      profile.availablePoints -= pointsToRedeem;

      // Add to history
      profile.pointsHistory.push({
        type: 'redeemed',
        amount: -pointsToRedeem,
        reason: reason
      });

      await profile.save();

      return {
        success: true,
        pointsRedeemed: pointsToRedeem,
        remainingBalance: profile.availablePoints
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  }

  // Check and unlock achievements
  static async checkAchievements(userId) {
    try {
      const profile = await LoyaltyProfile.findOne({ userId });
      const Booking = mongoose.model('Booking');
      const Review = mongoose.model('Review');

      if (!profile) return;

      const unlockedAchievements = [];

      // Get user data for achievement checks
      const totalBookings = profile.tierProgress.currentBookings;
      const totalSpend = profile.tierProgress.currentSpend;

      const userBookings = await Booking.find({ userId });
      const userReviews = await Review.find({ userId });

      // Check each achievement
      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (profile.achievements.some(a => a.achievementId === achievement.id)) {
          continue;
        }

        let unlocked = false;

        switch (achievement.id) {
          case 'first_booking':
            unlocked = totalBookings >= 1;
            break;

          case 'world_traveler':
            const uniqueCountries = new Set(userBookings.map(b => b.hotelId?.country).filter(Boolean));
            unlocked = uniqueCountries.size >= 10;
            break;

          case 'review_master':
            unlocked = userReviews.length >= 20;
            break;

          case 'photo_pro':
            const totalPhotos = userReviews.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
            unlocked = totalPhotos >= 50;
            break;

          case 'streak_7':
            unlocked = profile.streaks.currentBookingStreak >= 7;
            break;

          case 'big_spender':
            unlocked = totalSpend >= 10000;
            break;

          case 'referral_king':
            unlocked = profile.referralStats.successfulBookings >= 10;
            break;

          case 'weekend_warrior':
            const weekendBookings = userBookings.filter(b => {
              const checkIn = new Date(b.checkIn);
              return checkIn.getDay() === 5 || checkIn.getDay() === 6; // Friday or Saturday
            });
            unlocked = weekendBookings.length >= 10;
            break;

          case 'luxury_lover':
            const luxuryBookings = userBookings.filter(b => b.hotelId?.rating >= 9);
            unlocked = luxuryBookings.length >= 5;
            break;

          default:
            break;
        }

        if (unlocked) {
          // Unlock achievement
          profile.achievements.push({
            achievementId: achievement.id,
            unlockedAt: new Date(),
            pointsEarned: achievement.points
          });

          // Award points
          profile.totalPoints += achievement.points;
          profile.availablePoints += achievement.points;
          profile.lifetimePoints += achievement.points;

          profile.pointsHistory.push({
            type: 'bonus',
            amount: achievement.points,
            reason: `Achievement unlocked: ${achievement.name}`
          });

          unlockedAchievements.push(achievement);

          console.log(`🏆 Achievement unlocked for ${userId}: ${achievement.name} (+${achievement.points} points)`);
        }
      }

      if (unlockedAchievements.length > 0) {
        await profile.save();
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Process referral
  static async processReferral(referrerCode, newUserId) {
    try {
      // Find referrer
      const referrer = await LoyaltyProfile.findOne({ referralCode: referrerCode });

      if (!referrer) {
        return { success: false, message: 'Invalid referral code' };
      }

      // Initialize new user profile
      const newProfile = await this.initializeProfile(newUserId);

      // Set referrer
      newProfile.referredBy = referrerCode;

      // Bonus points for new user
      newProfile.totalPoints += 1000;
      newProfile.availablePoints += 1000;
      newProfile.lifetimePoints += 1000;

      newProfile.pointsHistory.push({
        type: 'bonus',
        amount: 1000,
        reason: 'Referral welcome bonus'
      });

      await newProfile.save();

      // Update referrer stats
      referrer.referralStats.totalInvites += 1;

      await referrer.save();

      return {
        success: true,
        newUserBonus: 1000,
        referrerCode: referrerCode
      };
    } catch (error) {
      console.error('Error processing referral:', error);
      throw error;
    }
  }

  // Complete referral (when new user makes first booking)
  static async completeReferral(newUserId) {
    try {
      const newProfile = await LoyaltyProfile.findOne({ userId: newUserId });

      if (!newProfile || !newProfile.referredBy) {
        return { success: false };
      }

      // Find referrer
      const referrer = await LoyaltyProfile.findOne({ referralCode: newProfile.referredBy });

      if (!referrer) {
        return { success: false };
      }

      // Award referrer
      const referralReward = 2000; // 2000 points for successful referral

      referrer.totalPoints += referralReward;
      referrer.availablePoints += referralReward;
      referrer.lifetimePoints += referralReward;

      referrer.referralStats.successfulBookings += 1;
      referrer.referralStats.totalEarned += referralReward;

      referrer.pointsHistory.push({
        type: 'bonus',
        amount: referralReward,
        reason: `Referral reward (${newUserId} made first booking)`
      });

      await referrer.save();

      // Check referrer achievements
      await this.checkAchievements(referrer.userId);

      console.log(`💰 Referral completed! ${referrer.userId} earned ${referralReward} points`);

      return {
        success: true,
        referrerReward: referralReward
      };
    } catch (error) {
      console.error('Error completing referral:', error);
      throw error;
    }
  }

  // Get tier benefits
  static getTierBenefits(tierName) {
    return TIERS[tierName] || TIERS.EXPLORER;
  }

  // Get all achievements list
  static getAllAchievements() {
    return ACHIEVEMENTS;
  }
}

module.exports = {
  LoyaltyProfile,
  LoyaltyEngine,
  TIERS,
  ACHIEVEMENTS
};
