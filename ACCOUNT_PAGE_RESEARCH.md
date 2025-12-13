# Account Page Design Research & Best Practices
### Research Report for HoP (House of Paradise) Travel Booking Platform

---

## Executive Summary

This document provides comprehensive research and analysis of account/profile page design patterns from industry-leading platforms (Booking.com, Airbnb, Discord) to inform the design and implementation of the HoP account management interface. The recommendations are tailored to align with your existing green theme (#10b981) and modern UI/UX standards.

---

## 1. Booking.com Account Page Analysis

### Navigation Structure
**Pattern: Sidebar Navigation with Icon-Based Menu**

Booking.com uses a persistent left sidebar navigation with the following key sections:

#### Primary Menu Items:
- **Personal details** (User icon) - Name, email, phone, address
- **Security** (Shield/Lock icon) - Password, two-factor authentication
- **Payment methods** (Credit card icon) - Saved cards, billing info
- **Preferences** (Settings icon) - Language, currency, notifications
- **Privacy & sharing** (Eye icon) - Data management, marketing preferences
- **Rewards & wallet** (Gift/Ticket icon) - Loyalty points, credits
- **Other travelers** (Users icon) - Travel companions management

#### Design Characteristics:
```
Layout: Fixed sidebar (240px width) + main content area
Color Scheme: Blue (#003580 primary) with white background
Typography: Clean sans-serif, clear hierarchy
Spacing: Generous whitespace, 24px padding
```

#### Key UX Patterns:
1. **Section Persistence**: Selected menu item highlighted with left border accent
2. **Breadcrumb Navigation**: Shows current location within account settings
3. **Inline Editing**: Click field to edit, with save/cancel buttons appearing
4. **Verification Badges**: Green checkmark for verified email/phone
5. **Progress Indicators**: For incomplete profile sections
6. **Success Messages**: Toast notifications at top after saving changes

#### Personal Information Section:
- **Layout**: Two-column grid on desktop, single column on mobile
- **Fields**: First name, Last name, Email (with verification status), Phone (with verification)
- **Address**: Separate expandable section with country, city, postal code
- **Edit Mode**: Individual field editing or full form edit mode toggle
- **Validation**: Real-time validation with inline error messages

#### Security Section Design:
```
┌─────────────────────────────────────────────────────┐
│ Password                                            │
│ ••••••••••                              [Change]    │
│ Last changed: 3 months ago                         │
├─────────────────────────────────────────────────────┤
│ Two-factor authentication                 [OFF]     │
│ Add an extra layer of security            [Setup]   │
├─────────────────────────────────────────────────────┤
│ Active sessions                                     │
│ Current session - Windows • Chrome                  │
│ • 192.168.1.1 • Last active: now                   │
│                                         [Sign out]  │
└─────────────────────────────────────────────────────┘
```

---

## 2. Airbnb Profile & Account Settings Analysis

### Navigation Structure
**Pattern: Horizontal Tab Navigation with Responsive Sidebar**

Airbnb uses a hybrid approach: tabs on desktop, collapsible menu on mobile

#### Primary Sections:
- **Personal info** - Basic profile information
- **Login & security** - Password, social accounts, 2FA
- **Payments & payouts** - Payment methods, payout methods
- **Taxes** - Tax information for hosts
- **Notifications** - Email, SMS, push notification preferences
- **Privacy & sharing** - Data visibility, activity status
- **Global preferences** - Language, currency, timezone
- **Travel for work** - Business travel settings
- **Professional hosting tools** - Host-specific features
- **Referral credit & coupon** - Rewards and credits

#### Design Characteristics:
```
Layout: Horizontal tabs (desktop) / Hamburger menu (mobile)
Color Scheme: Pink accent (#FF385C), minimal gray backgrounds
Typography: Airbnb Cereal font, modern and friendly
Card-based: Each setting group in bordered cards
Spacing: 16px between cards, 32px section padding
```

#### Key UX Patterns:
1. **Card-Based Layout**: Each setting group in a separate card with clear borders
2. **Profile Photo Upload**: Large circular avatar with hover overlay and camera icon
3. **Verification System**: Multiple verification types with badges
   - Email verified ✓
   - Phone verified ✓
   - Government ID verified ✓
   - Trust indicators prominently displayed
4. **Expandable Sections**: Click to expand detailed settings
5. **Side-Panel Editing**: Some forms open in right-side panel instead of new page
6. **Contextual Help**: Question mark icons with tooltips
7. **Confirmation Modals**: For critical actions (delete account, sign out all devices)

#### Personal Information Card:
```
┌──────────────────────────────────────────────────────┐
│ Legal name                                  [Edit]   │
│ John Smith                                           │
│                                                      │
│ Email address                             [Edit]     │
│ john.smith@email.com                                 │
│ ✓ Verified                                          │
│                                                      │
│ Phone numbers                             [Add]      │
│ +1 555-0123                              ✓ Verified │
│                                                      │
│ Government ID                                        │
│ Not provided                              [Add]      │
└──────────────────────────────────────────────────────┘
```

#### Login & Security Features:
- **Password**: Shows last update time, strong password requirements
- **Two-Factor Authentication**: SMS or authenticator app options
- **Social Accounts**: Link/unlink Facebook, Google, Apple
- **Login History**: Shows recent login attempts with location
- **Active Sessions**: List all devices with sign-out options

#### Profile Photo Handling:
```
┌─────────────────────────────────────────────┐
│         ┌───────────────┐                   │
│         │               │                   │
│         │   [AVATAR]    │ ← 200x200px       │
│         │               │                   │
│         └───────────────┘                   │
│         On hover: Camera icon overlay       │
│         Click to upload new photo           │
│                                             │
│ Accepted formats: JPG, PNG                  │
│ Maximum size: 10 MB                         │
│ Recommended: 400x400px or larger            │
└─────────────────────────────────────────────┘
```

---

## 3. Discord User Settings Analysis (Security Reference)

### Navigation Structure
**Pattern: Sidebar Navigation with Categorized Groups**

Discord uses a left sidebar with grouped categories for settings:

#### Category Structure:
**USER SETTINGS**
- My Account
- Privacy & Safety
- Authorized Apps
- Connections
- Friend Requests

**BILLING SETTINGS**
- Nitro
- Server Boost
- Subscriptions
- Gift Inventory

**APP SETTINGS**
- Appearance (Dark/Light mode)
- Accessibility
- Voice & Video
- Text & Images
- Notifications
- Keybinds
- Language
- Advanced

#### Design Characteristics:
```
Layout: Fixed sidebar (220px) + scrollable content (max 740px)
Color Scheme: Dark mode optimized (#36393f background, #202225 sidebar)
Typography: Whitney font, 14-16px body text
Visual Style: Modern, gaming-focused, high contrast
```

#### My Account Section:
```
┌────────────────────────────────────────────────────┐
│  [LARGE BANNER IMAGE]                              │
│                                                    │
│  ┌────┐                                           │
│  │    │  Username#1234                           │
│  │ PF │  user@email.com                          │
│  │    │                                          │
│  └────┘  [Edit User Profile]                     │
│                                                   │
├───────────────────────────────────────────────────┤
│  USERNAME                              [Edit]     │
│  Username#1234                                   │
│                                                  │
│  EMAIL                              ✓ Verified    │
│  user@email.com                        [Edit]    │
│                                                  │
│  PHONE NUMBER                                    │
│  +1 (555) 123-4567                    [Edit]    │
│                                                  │
│  [Change Password]                               │
│  [Remove Account]                                │
└──────────────────────────────────────────────────┘
```

#### Security Page (Two-Factor Authentication):
**Best-in-class 2FA implementation**

```
┌────────────────────────────────────────────────────┐
│  ENABLE TWO-FACTOR AUTHENTICATION                  │
│                                                    │
│  [Shield Icon]  Two-Factor Authentication          │
│                                                    │
│  Protect your Discord account with an extra       │
│  layer of security. Once configured, you'll be    │
│  required to enter both your password and an      │
│  authentication code from your mobile device      │
│  in order to sign in.                             │
│                                                    │
│  Current Status: DISABLED                         │
│  [Enable Two-Factor Auth]                         │
│                                                    │
├───────────────────────────────────────────────────┤
│  SMS AUTHENTICATION (Fallback)                    │
│  Add a phone number as backup                     │
│  [Add Phone Number]                               │
└───────────────────────────────────────────────────┘
```

#### Password Change Flow:
```
1. Enter current password
2. Enter new password (strength indicator)
3. Confirm new password
4. [Change Password] button
5. Confirmation: "Password successfully changed"
```

#### Session Management:
- **Active Sessions List**: Shows all logged-in devices
- **Device Info**: Browser, OS, location, last active time
- **Quick Actions**: "Sign out" individual sessions or "Sign out all"
- **Current Device**: Clearly marked with "This device" label

---

## 4. Common Design Patterns Across Platforms

### A. Navigation Patterns

#### 1. Sidebar Navigation (Booking.com, Discord)
**Best for**: Desktop-first applications, many settings sections
```
Pros:
- Always visible navigation
- Can accommodate many items
- Clear visual hierarchy
- Easy to scan

Cons:
- Takes horizontal space
- Needs mobile adaptation
- Can feel cluttered with too many items
```

#### 2. Tab Navigation (Airbnb)
**Best for**: Fewer sections, mobile-responsive designs
```
Pros:
- Clean, minimal interface
- Good for 3-7 main sections
- Works well on mobile
- Feels modern

Cons:
- Limited scalability
- Hidden subsections
- May require scrolling
```

#### 3. Accordion/Expandable (Mobile Adaptation)
**Best for**: Mobile devices, space-constrained interfaces
```
Pros:
- Space efficient
- Progressive disclosure
- Touch-friendly
- Reduces cognitive load

Cons:
- More clicks required
- Can hide important options
- Slower navigation
```

### B. Form Design Patterns

#### 1. Inline Editing (Booking.com style)
```javascript
// Pseudo-code pattern
Field Display Mode:
  [Label]
  Value text
  [Edit button]

Field Edit Mode:
  [Label]
  <Input field>
  [Save] [Cancel]
```

**Benefits**:
- Minimal UI
- Edit only what you need
- Clear current vs. edit state
- Prevents accidental changes

#### 2. Form Edit Mode (Traditional)
```javascript
// Toggle entire form
Normal Mode: Read-only display
Edit Mode: All fields become inputs
Actions: [Save Changes] [Cancel]
```

**Benefits**:
- Batch editing
- Single save action
- Familiar pattern
- Better for multiple field changes

#### 3. Side Panel Editing (Airbnb style)
```javascript
// Open editing in overlay panel
Main View: Shows summary
Click Edit: Slides in right panel
Panel Contents: Form + Save/Cancel
```

**Benefits**:
- Context preservation
- Smooth transitions
- Mobile-friendly
- Modern feel

### C. Profile Image Upload Patterns

#### Common Implementation:
```
Visual Design:
- Circular avatar (120-200px diameter)
- Hover overlay with camera/edit icon
- Upload progress indicator
- Preview before save

Technical Requirements:
- Max file size: 5-10 MB
- Accepted formats: JPG, PNG, WebP
- Aspect ratio: 1:1 (square)
- Minimum resolution: 200x200px
- Optional: Auto-crop tool

UX Flow:
1. Click avatar area
2. File picker opens
3. Preview uploaded image
4. Crop/adjust if needed
5. Save/Cancel options
6. Upload with progress indicator
7. Success message + updated avatar
```

### D. Security Feature Presentation

#### Password Change Pattern:
```
┌────────────────────────────────────────────┐
│ CHANGE PASSWORD                            │
│                                            │
│ Current Password                           │
│ [........................]                 │
│ [Show] [Forgot password?]                 │
│                                            │
│ New Password                               │
│ [........................]  [Show]         │
│ Strength: ▓▓▓▓▓▓░░░░ Strong               │
│                                            │
│ Confirm New Password                       │
│ [........................]  [Show]         │
│ ✓ Passwords match                         │
│                                            │
│         [Cancel]  [Change Password]        │
└────────────────────────────────────────────┘

Requirements Display:
✓ At least 8 characters
✓ Contains uppercase letter
✓ Contains lowercase letter
✓ Contains number
✗ Contains special character
```

#### Two-Factor Authentication Setup:
```
Step 1: Download Authenticator App
  - Google Authenticator
  - Authy
  - Microsoft Authenticator

Step 2: Scan QR Code
  [QR CODE IMAGE]
  Or enter code manually: XXXX-XXXX-XXXX

Step 3: Enter Verification Code
  [6-digit code input]

Step 4: Save Backup Codes
  Download or print backup codes
  Use if you lose access to device

Complete: 2FA Enabled ✓
```

#### Session Management Display:
```
┌────────────────────────────────────────────────┐
│ ACTIVE SESSIONS                                │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 🖥️ Current Session                        │  │
│ │ Windows 10 • Chrome 120                   │  │
│ │ IP: 192.168.1.100                        │  │
│ │ Location: New York, USA                  │  │
│ │ Last active: Now                         │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 📱 Mobile Device                          │  │
│ │ iPhone 14 • Safari                        │  │
│ │ IP: 172.20.10.5                          │  │
│ │ Location: Boston, USA                    │  │
│ │ Last active: 2 hours ago  [Sign Out]    │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ [Sign Out All Other Sessions]                 │
└────────────────────────────────────────────────┘
```

### E. Success/Error Message Patterns

#### Toast Notifications (Recommended):
```javascript
Success:
  Position: Top-right or top-center
  Duration: 3-5 seconds
  Style: Green background (#10b981), white text
  Icon: Checkmark ✓
  Animation: Slide in from top, fade out

Error:
  Position: Top-right or top-center
  Duration: 5-8 seconds (longer for errors)
  Style: Red background (#ef4444), white text
  Icon: X or warning triangle
  Animation: Shake on appear, fade out

Info:
  Position: Top-right or top-center
  Duration: 4-6 seconds
  Style: Blue background (#3b82f6), white text
  Icon: Info (i)
  Animation: Slide in from top, fade out
```

#### Inline Validation Messages:
```html
Error State:
<input class="error" />
<span class="error-message">
  ⚠️ Email address is invalid
</span>

Success State:
<input class="success" />
<span class="success-message">
  ✓ Email is available
</span>

Styling:
.error {
  border: 2px solid #ef4444;
}
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

### F. Save/Cancel Button Placement

#### Pattern 1: Bottom-Right (Most Common)
```
[Cancel]  [Save Changes]
  ↑           ↑
Secondary   Primary
```

#### Pattern 2: Top-Right (Inline editing)
```
Section Header          [Cancel] [Save]
```

#### Pattern 3: Sticky Footer (Long forms)
```
Fixed bottom bar:
[Discard Changes]           [Save Changes]
```

**Best Practices**:
- Primary action (Save) on the right
- Secondary action (Cancel) on the left
- Different visual weight (bold primary)
- Disabled state until changes made
- Loading state during save
- Success message after save

---

## 5. Recommended Architecture for HoP Account Page

### A. Navigation Structure Recommendation

**Chosen Pattern: Sidebar Navigation (Discord/Booking.com style)**

Rationale:
- Matches your existing Profile page structure
- Accommodates future expansion
- Professional appearance for travel booking
- Works well with your green theme
- Better for desktop-first with mobile adaptation

### B. Proposed Section Organization

```
┌────────────────────────────────────────────────────────────┐
│  HOUSE OF PARADISE - Account Settings                     │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│ [SECTIONS]   │         [CONTENT AREA]                     │
│              │                                             │
│ 👤 Profile   │  Profile information, avatar, bio          │
│              │                                             │
│ 🔒 Security  │  Password, 2FA, sessions                   │
│              │                                             │
│ 💳 Payments  │  Payment methods, billing history          │
│              │                                             │
│ 🔔 Notif.    │  Email, push, SMS preferences             │
│              │                                             │
│ 🎨 Prefer.   │  Theme, language, currency                │
│              │                                             │
│ 🔐 Privacy   │  Data settings, visibility                │
│              │                                             │
│ ⭐ Rewards   │  Loyalty points, referrals                │
│              │                                             │
│ 📊 Activity  │  Booking history, reviews                 │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### C. Detailed Page Structure

#### Section 1: Profile Information
```jsx
Features:
- Large circular avatar (150px) with upload on hover
- Full name (editable)
- Email address (with verification badge)
- Phone number (with verification option)
- Location/Address
- Bio/About me (optional)
- Member since date (read-only)
- Account status badge

Edit Mode: Inline editing per field
Validation: Real-time with inline messages
Save: Individual field save or batch save option
```

#### Section 2: Security Settings
```jsx
Components:
1. Password Management
   - Current password masked
   - Last changed date
   - [Change Password] button → Modal/Panel

2. Two-Factor Authentication
   - Current status: Enabled/Disabled
   - Setup wizard (QR code, backup codes)
   - [Enable/Disable 2FA] toggle

3. Login History
   - Table of recent login attempts
   - Columns: Date, Location, Device, IP, Status
   - Filter by date range

4. Active Sessions
   - List of current sessions
   - Device info, location, last active
   - [Sign Out] per session
   - [Sign Out All Devices] bulk action

5. Security Questions (Optional)
   - Set/update security questions
   - For password recovery

Layout: Stacked cards with clear separation
```

#### Section 3: Payment Methods
```jsx
Features:
- List of saved payment methods
- Card display: Last 4 digits, brand logo, expiry
- Set default payment method
- Add new payment method modal
- Remove payment method (with confirmation)
- Billing address
- Payment history table

Security:
- PCI compliance messaging
- Encrypted data indicators
- CVV never stored message
```

#### Section 4: Notifications
```jsx
Organized by Category:
- Booking Updates (email, push, SMS)
- Promotional Offers (email only)
- Price Alerts (email, push)
- Account Security (email, SMS - forced)
- Newsletter (email)
- Review Reminders (email, push)

UI: Toggle switches with descriptions
Grouped by notification type
Some forced on (security) with lock icon
```

#### Section 5: Preferences
```jsx
Settings:
- Theme: Light/Dark/Auto
- Language: Dropdown selector
- Currency: Dropdown selector
- Timezone: Auto-detect or manual
- Date Format: MM/DD/YYYY vs DD/MM/YYYY
- Distance Units: Miles vs Kilometers
- Accessibility Options:
  - Larger text
  - High contrast mode
  - Screen reader optimizations
```

#### Section 6: Privacy & Data
```jsx
Controls:
- Profile visibility (Public/Private)
- Show activity status (Online/Offline)
- Search engine visibility
- Data sharing preferences
- Marketing preferences
- Cookie settings
- Download my data (GDPR)
- Delete account (with multi-step confirmation)
```

#### Section 7: Rewards & Loyalty
```jsx
Display:
- Current points balance (large, prominent)
- Points history table
- Rewards available
- Referral link generator
- Referral statistics
- Special offers/coupons
- Tier status (if tiered system)

Visual: Use green theme for points/rewards
```

#### Section 8: Activity History
```jsx
Tabs:
1. Bookings
   - Upcoming, Past, Cancelled
   - Sort by date
   - Quick actions: View, Review, Rebook

2. Reviews
   - Reviews I've written
   - Edit/delete options

3. Wishlist Items
   - Grid view of saved hotels
   - Remove from wishlist

4. Searches
   - Recent search history
   - Quick re-search
```

---

## 6. Specific UI/UX Elements to Implement

### A. Component Library Checklist

#### Core Components:
- [ ] Avatar Upload Component
  - File picker
  - Image crop tool
  - Preview
  - Progress indicator
  - Error handling

- [ ] Form Field Components
  - Text Input (with validation)
  - Email Input (with format validation)
  - Phone Input (with country code)
  - Password Input (with show/hide toggle)
  - Date Picker
  - Dropdown/Select
  - Toggle Switch
  - Radio Buttons
  - Checkboxes

- [ ] Notification Components
  - Toast Notifications (Success, Error, Info, Warning)
  - Inline Validation Messages
  - Banner Notifications (Account-wide messages)

- [ ] Modal/Dialog Components
  - Confirmation Modal (for destructive actions)
  - Form Modal (for password change, 2FA setup)
  - Full-screen Modal (for onboarding)

- [ ] Card Components
  - Setting Card
  - Payment Method Card
  - Session Card
  - Stat Card (for rewards/points)

- [ ] Button Components
  - Primary Button (green #10b981)
  - Secondary Button (outlined)
  - Danger Button (red for delete)
  - Icon Button
  - Loading Button (with spinner)

- [ ] Layout Components
  - Sidebar Navigation
  - Content Container
  - Section Header
  - Divider/Separator

#### Navigation Components:
- [ ] Sidebar Menu
  - Active state highlighting
  - Icon + Label
  - Badge for notifications
  - Collapsible on mobile

- [ ] Mobile Menu
  - Hamburger toggle
  - Slide-in drawer
  - Overlay backdrop

- [ ] Breadcrumbs (optional)
  - Show navigation path
  - Clickable parent levels

### B. Interaction Patterns

#### Editing Flow:
```javascript
State Management:
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState(originalData);
const [hasChanges, setHasChanges] = useState(false);

Edit Flow:
1. User clicks [Edit]
2. Fields become editable
3. Show [Save] [Cancel] buttons
4. Track changes (hasChanges)
5. Enable [Save] only if hasChanges
6. On Save: Validate → API call → Success message → Exit edit mode
7. On Cancel: Revert changes → Exit edit mode

Unsaved Changes Warning:
if (hasChanges && userTriesToLeave) {
  showConfirmation('You have unsaved changes. Discard?');
}
```

#### Validation Pattern:
```javascript
Real-time Validation:
- On blur (when user leaves field)
- On submit (before save)
- Clear errors on input change

Validation Rules:
- Required fields
- Format validation (email, phone)
- Length constraints (min/max)
- Pattern matching (regex)
- Custom business rules

Display:
- Icon indicator (✓ or ✗)
- Error message below field
- Error border color
- Success border color
```

#### Loading States:
```javascript
Scenarios:
1. Initial page load
   - Skeleton loaders for content
   - Spinner for full page

2. Saving changes
   - Button shows spinner
   - Button text: "Saving..."
   - Disable form during save

3. Uploading files
   - Progress bar (0-100%)
   - Cancel upload option
   - Preview during upload

4. Loading more data
   - "Load More" button with spinner
   - Infinite scroll with indicator
```

### C. Responsive Design Breakpoints

```css
/* Mobile First Approach */

/* Mobile: 320px - 767px */
@media (max-width: 767px) {
  - Sidebar becomes top navigation
  - Hamburger menu
  - Single column layout
  - Stack buttons vertically
  - Larger touch targets (min 44px)
  - Full-width inputs
  - Hide secondary information
  - Compact avatars (100px)
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  - Collapsible sidebar
  - Two-column forms
  - Show sidebar icons only (collapsed)
  - Medium avatars (120px)
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  - Full sidebar (240px)
  - Multi-column layouts
  - Hover effects
  - Tooltips
  - Large avatars (150px)
  - Side-by-side buttons
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  - Max content width (1200px)
  - Centered content
  - More whitespace
  - Larger typography
}
```

### D. Accessibility Requirements

```javascript
WCAG 2.1 AA Compliance:

1. Keyboard Navigation
   - Tab order makes sense
   - Focus indicators visible
   - Skip navigation link
   - Escape key closes modals

2. Screen Reader Support
   - Semantic HTML (nav, main, section, article)
   - ARIA labels for icons
   - ARIA live regions for dynamic content
   - Alt text for images
   - Label associations for inputs

3. Color Contrast
   - Text: 4.5:1 minimum ratio
   - Large text: 3:1 minimum
   - Icons: 3:1 minimum
   - Test with tools (WAVE, axe)

4. Form Accessibility
   - Labels for all inputs
   - Error messages linked to fields
   - Required field indicators
   - Help text associated with inputs

5. Focus Management
   - Visible focus indicators
   - Focus trap in modals
   - Return focus after modal close
   - Focus on first error after submit

6. Responsive Text
   - Text zoom up to 200%
   - No horizontal scrolling
   - Reflow content
```

---

## 7. Security Features Implementation Guide

### A. Password Change Workflow

```javascript
// Recommended Implementation

Step 1: User clicks "Change Password"
Step 2: Open modal/panel with form

Form Fields:
1. Current Password
   - Type: password
   - Validation: Required
   - Verify against backend

2. New Password
   - Type: password
   - Real-time strength indicator
   - Requirements checklist

3. Confirm Password
   - Type: password
   - Must match new password
   - Show match indicator

Password Requirements:
✓ At least 8 characters
✓ Contains uppercase letter (A-Z)
✓ Contains lowercase letter (a-z)
✓ Contains number (0-9)
✓ Contains special character (!@#$%^&*)
✓ Not a common password

Strength Indicator:
Weak: ▓░░░░ (Red)
Fair: ▓▓░░░ (Orange)
Good: ▓▓▓░░ (Yellow)
Strong: ▓▓▓▓░ (Light Green)
Excellent: ▓▓▓▓▓ (Green #10b981)

Submit Process:
1. Validate all fields
2. Make API call: POST /api/auth/change-password
3. Show loading state
4. Handle response:
   Success:
     - Close modal
     - Show success toast
     - Force re-login (optional)
   Error:
     - Show error message
     - Keep modal open
     - Focus on error field

Security Measures:
- Rate limit password change attempts
- Require current password
- Log password changes
- Send email notification
- Optional: Force session logout on all devices
```

### B. Two-Factor Authentication (2FA) Setup

```javascript
// Complete 2FA Implementation Flow

Feature Detection:
if (user.has2FAEnabled) {
  show: "Disable 2FA" button
} else {
  show: "Enable 2FA" button
}

Setup Workflow:

Step 1: Introduction
┌─────────────────────────────────────────────┐
│ Enable Two-Factor Authentication            │
│                                             │
│ Add an extra layer of security to your     │
│ account. You'll need to enter a code from  │
│ your phone every time you sign in.         │
│                                             │
│ Requirements:                               │
│ • Smartphone                                │
│ • Authenticator app (Google, Authy, etc.)  │
│                                             │
│ [Cancel]                        [Continue] │
└─────────────────────────────────────────────┘

Step 2: Verify Password
┌─────────────────────────────────────────────┐
│ Confirm your password                       │
│                                             │
│ Enter your current password to continue    │
│                                             │
│ Password                                    │
│ [................................]  [Show]  │
│                                             │
│ [Back]                          [Continue] │
└─────────────────────────────────────────────┘

Step 3: Scan QR Code
┌─────────────────────────────────────────────┐
│ Scan QR Code                                │
│                                             │
│ 1. Open your authenticator app             │
│ 2. Scan this QR code:                       │
│                                             │
│     ┌─────────────────┐                    │
│     │                 │                    │
│     │   [QR CODE]     │                    │
│     │                 │                    │
│     └─────────────────┘                    │
│                                             │
│ Or enter code manually:                     │
│ ABCD EFGH IJKL MNOP QRST UVWX              │
│ [Copy Code]                                 │
│                                             │
│ [Back]                          [Continue] │
└─────────────────────────────────────────────┘

Step 4: Verify Code
┌─────────────────────────────────────────────┐
│ Enter verification code                     │
│                                             │
│ Enter the 6-digit code from your app:      │
│                                             │
│ [___] [___] [___] [___] [___] [___]        │
│                                             │
│ Can't scan the code?                        │
│ [Enter code manually]                       │
│                                             │
│ [Back]                            [Verify]  │
└─────────────────────────────────────────────┘

Step 5: Backup Codes
┌─────────────────────────────────────────────┐
│ Save your backup codes                      │
│                                             │
│ Keep these codes safe. You can use them to │
│ access your account if you lose your phone.│
│                                             │
│ Each code can be used only once.            │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ABCD-EFGH-IJKL-MNOP                     │ │
│ │ QRST-UVWX-YZAB-CDEF                     │ │
│ │ GHIJ-KLMN-OPQR-STUV                     │ │
│ │ WXYZ-ABCD-EFGH-IJKL                     │ │
│ │ MNOP-QRST-UVWX-YZAB                     │ │
│ │ CDEF-GHIJ-KLMN-OPQR                     │ │
│ │ STUV-WXYZ-ABCD-EFGH                     │ │
│ │ IJKL-MNOP-QRST-UVWX                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Download]  [Print]  [Copy to Clipboard]   │
│                                             │
│                                    [Done]   │
└─────────────────────────────────────────────┘

Step 6: Success
┌─────────────────────────────────────────────┐
│ ✓ Two-Factor Authentication Enabled         │
│                                             │
│ Your account is now more secure!            │
│                                             │
│ Next time you sign in, you'll need:        │
│ • Your password                             │
│ • A code from your authenticator app        │
│                                             │
│ [View Backup Codes]              [Close]    │
└─────────────────────────────────────────────┘

Backend API Endpoints:
POST /api/auth/2fa/setup
  - Generate secret
  - Return QR code URL
  - Return manual entry code

POST /api/auth/2fa/verify
  - Verify setup code
  - Enable 2FA for user
  - Return backup codes

POST /api/auth/2fa/disable
  - Verify password
  - Disable 2FA
  - Invalidate secret

POST /api/auth/2fa/regenerate-codes
  - Generate new backup codes
  - Invalidate old ones

Database Schema:
users table:
  - twoFactorEnabled: boolean
  - twoFactorSecret: string (encrypted)
  - backupCodes: array (hashed)
  - backupCodesUsed: array
```

### C. Session Management

```javascript
// Active Sessions Display & Management

Data to Show:
{
  sessionId: "unique-session-id",
  device: {
    type: "desktop" | "mobile" | "tablet",
    name: "Chrome 120 on Windows 10",
    icon: "🖥️" | "📱" | "💻"
  },
  location: {
    city: "New York",
    region: "NY",
    country: "USA",
    ip: "192.168.1.100" (optional, privacy concern)
  },
  lastActive: "2024-01-15T10:30:00Z",
  isCurrent: true | false,
  createdAt: "2024-01-14T08:00:00Z"
}

UI Component:
┌────────────────────────────────────────────────────┐
│ ACTIVE SESSIONS                                    │
│                                                    │
│ You are currently signed in on these devices.     │
│ If you see a device you don't recognize, sign    │
│ it out immediately.                                │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🖥️ Current Device                             │  │
│ │                                              │  │
│ │ Chrome 120 on Windows 10                     │  │
│ │ New York, NY • United States                 │  │
│ │ Last active: Now                             │  │
│ │ Signed in: 2 days ago                        │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📱 iPhone 14                                  │  │
│ │                                              │  │
│ │ Safari on iOS 17                             │  │
│ │ Boston, MA • United States                   │  │
│ │ Last active: 3 hours ago                     │  │
│ │ Signed in: 5 days ago                        │  │
│ │                              [Sign Out]      │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 💻 MacBook Pro                                │  │
│ │                                              │  │
│ │ Firefox 121 on macOS 14                      │  │
│ │ San Francisco, CA • United States            │  │
│ │ Last active: 1 day ago                       │  │
│ │ Signed in: 1 week ago                        │  │
│ │                              [Sign Out]      │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ [Sign Out All Other Sessions]                     │
└────────────────────────────────────────────────────┘

Sign Out Confirmation:
┌─────────────────────────────────────────────┐
│ Sign out this device?                       │
│                                             │
│ You'll need to sign in again to use HoP    │
│ on this device.                             │
│                                             │
│ Device: iPhone 14                           │
│ Last active: 3 hours ago                    │
│                                             │
│ [Cancel]                        [Sign Out]  │
└─────────────────────────────────────────────┘

Sign Out All Confirmation:
┌─────────────────────────────────────────────┐
│ Sign out all devices?                       │
│                                             │
│ This will sign you out of:                 │
│ • 2 other devices                           │
│                                             │
│ You'll stay signed in on this device.      │
│                                             │
│ Use this if you think your account has     │
│ been compromised.                           │
│                                             │
│ [Cancel]                  [Sign Out All]    │
└─────────────────────────────────────────────┘

Backend Implementation:
POST /api/auth/sessions
  - List all active sessions
  - Include device info, location
  - Mark current session

DELETE /api/auth/sessions/:sessionId
  - Sign out specific session
  - Invalidate session token

DELETE /api/auth/sessions/all
  - Sign out all except current
  - Invalidate all other tokens

Session Token Management:
- Store session ID in database
- Associate with user ID
- Include device fingerprint
- Track last activity timestamp
- Set expiration time (30 days)
- Refresh token on activity
- Clean up expired sessions

Security Considerations:
- Use JWT or session cookies
- HttpOnly, Secure, SameSite flags
- Rotate tokens on sensitive actions
- Rate limit session creation
- Log suspicious activity
- Alert user of new sign-ins
- Optional: Require password for sign-out-all
```

---

## 8. Recommended Implementation for HoP

### Phase 1: Core Structure (Week 1)
```javascript
✅ Tasks:
1. Create sidebar navigation component
   - Responsive (desktop + mobile)
   - Icon + label for each section
   - Active state highlighting
   - Smooth transitions

2. Setup routing for account sections
   - /account/profile
   - /account/security
   - /account/payments
   - /account/notifications
   - /account/preferences
   - /account/privacy
   - /account/rewards
   - /account/activity

3. Create base layout component
   - Sidebar + content area
   - Mobile menu toggle
   - Breadcrumb navigation
   - Page header component

4. Design token setup
   - Green theme variables (#10b981)
   - Spacing, typography, shadows
   - Animation timings
   - Breakpoints
```

### Phase 2: Profile Section (Week 2)
```javascript
✅ Tasks:
1. Avatar upload component
   - File picker
   - Image preview
   - Crop functionality
   - Upload progress
   - Error handling

2. Personal information form
   - Name fields
   - Email (with verification badge)
   - Phone (with verification)
   - Location/Address
   - Bio/About

3. Edit mode functionality
   - Toggle edit/view state
   - Form validation
   - Save/cancel actions
   - Success/error messages

4. Member stats display
   - Member since date
   - Account type badge
   - Verification status
```

### Phase 3: Security Section (Week 3)
```javascript
✅ Tasks:
1. Password change modal
   - Current password field
   - New password with strength indicator
   - Confirmation field
   - Validation and submission

2. Two-factor authentication setup
   - QR code generation
   - Manual code entry
   - Verification step
   - Backup codes generation
   - Enable/disable toggle

3. Session management
   - Active sessions list
   - Device information display
   - Sign out individual sessions
   - Sign out all functionality

4. Login history
   - Recent login attempts
   - Device and location info
   - Date/time display
   - Suspicious activity flagging
```

### Phase 4: Additional Sections (Week 4)
```javascript
✅ Tasks:
1. Notifications preferences
   - Category toggles
   - Email/SMS/Push options
   - Grouped settings
   - Save preferences

2. Theme & preferences
   - Dark/Light mode toggle
   - Language selector
   - Currency selector
   - Other UI preferences

3. Payment methods (if applicable)
   - List saved cards
   - Add new payment method
   - Set default
   - Remove methods

4. Privacy settings
   - Profile visibility
   - Data sharing options
   - GDPR compliance features
   - Delete account option
```

### Phase 5: Polish & Testing (Week 5)
```javascript
✅ Tasks:
1. Animations and transitions
   - Page transitions
   - Loading states
   - Success animations
   - Error states

2. Responsive design
   - Mobile optimization
   - Tablet layout
   - Touch interactions
   - Hamburger menu

3. Accessibility
   - Keyboard navigation
   - Screen reader support
   - ARIA labels
   - Focus management

4. Testing
   - Unit tests
   - Integration tests
   - E2E tests
   - Accessibility audit
   - Cross-browser testing
```

---

## 9. Design System Integration

### A. Color Palette (Adapted to Green Theme)

```css
:root {
  /* Primary Colors - Green Theme */
  --primary-50: #ecfdf5;   /* Very light green */
  --primary-100: #d1fae5;  /* Light green */
  --primary-200: #a7f3d0;  /* Lighter green */
  --primary-300: #6ee7b7;  /* Light-medium green */
  --primary-400: #34d399;  /* Medium green */
  --primary-500: #10b981;  /* Primary green (base) */
  --primary-600: #059669;  /* Dark green */
  --primary-700: #047857;  /* Darker green */
  --primary-800: #065f46;  /* Very dark green */
  --primary-900: #064e3b;  /* Almost black green */

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Status Colors */
  --success: #10b981;  /* Matches primary */
  --warning: #f59e0b;  /* Amber */
  --error: #ef4444;    /* Red */
  --info: #3b82f6;     /* Blue */

  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;

  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;

  /* Border Colors */
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;
  --border-focus: #10b981;

  /* Dark Mode (if implemented) */
  --dark-bg-primary: #0a0a1a;
  --dark-bg-secondary: #1a1a2e;
  --dark-bg-tertiary: #2a2a3e;
  --dark-text-primary: #ffffff;
  --dark-text-secondary: #e5e7eb;
  --dark-border-primary: #2a2a3e;
}
```

### B. Typography Scale

```css
:root {
  /* Font Family */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
               'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### C. Spacing System

```css
:root {
  /* Spacing Scale (based on 4px) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### D. Component Specifications

#### Button Styles
```css
.btn {
  /* Base styles */
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--primary-500);
  color: var(--text-inverse);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background: var(--primary-600);
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--primary-700);
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--primary-600);
  border: 2px solid var(--primary-500);
}

.btn-secondary:hover {
  background: var(--primary-50);
  border-color: var(--primary-600);
}

.btn-danger {
  background: var(--error);
  color: var(--text-inverse);
}

.btn-danger:hover {
  background: #dc2626;
}
```

#### Input Styles
```css
.input {
  /* Base styles */
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input:disabled {
  background: var(--gray-100);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--error);
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input.success {
  border-color: var(--success);
}
```

#### Card Styles
```css
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}
```

---

## 10. Code Examples & Templates

### A. Account Page Layout Component

```jsx
// AccountLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  User, Lock, CreditCard, Bell, Settings,
  Shield, Gift, Activity, Menu, X
} from 'lucide-react';

const AccountLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/account/profile',
      description: 'Manage your personal information'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Lock,
      path: '/account/security',
      description: 'Password, 2FA, and sessions'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      path: '/account/payments',
      description: 'Payment methods and billing'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/account/notifications',
      description: 'Email and push preferences'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Settings,
      path: '/account/preferences',
      description: 'Theme, language, and settings'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Shield,
      path: '/account/privacy',
      description: 'Data and privacy settings'
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Gift,
      path: '/account/rewards',
      description: 'Loyalty points and referrals'
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      path: '/account/activity',
      description: 'Bookings and history'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      <div style={styles.mobileHeader}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={styles.menuButton}
          className="clickable"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 style={styles.mobileTitle}>Account Settings</h1>
      </div>

      <div style={styles.content}>
        {/* Sidebar Navigation */}
        <nav style={{
          ...styles.sidebar,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Account Settings</h2>
          </div>

          <ul style={styles.menuList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.id} style={styles.menuItem}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      ...styles.menuButton,
                      ...(active ? styles.menuButtonActive : {})
                    }}
                    className="clickable"
                  >
                    <Icon
                      size={20}
                      color={active ? '#10b981' : '#6b7280'}
                    />
                    <div style={styles.menuButtonText}>
                      <span style={{
                        ...styles.menuLabel,
                        color: active ? '#10b981' : '#1f2937'
                      }}>
                        {item.label}
                      </span>
                      <span style={styles.menuDescription}>
                        {item.description}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  mobileHeader: {
    display: 'none',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  mobileTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  content: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sidebar: {
    width: '280px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto',
    transition: 'transform 0.3s ease',
  },
  sidebarHeader: {
    padding: '2rem 1.5rem 1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1f2937',
  },
  menuList: {
    listStyle: 'none',
    padding: '1rem 0',
  },
  menuItem: {
    padding: '0 0.75rem',
  },
  menuButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  menuButtonActive: {
    background: 'rgba(16, 185, 129, 0.1)',
  },
  menuButtonText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  menuLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  menuDescription: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    lineHeight: 1.3,
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '900px',
  },
  overlay: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
};

// Media query for mobile
const mediaQuery = `
  @media (max-width: 768px) {
    .mobile-header {
      display: flex !important;
    }
    .sidebar {
      position: fixed !important;
      z-index: 10;
      left: 0;
      top: 0;
    }
    .overlay {
      display: block !important;
    }
    .main {
      padding: 1rem !important;
    }
  }
`;

export default AccountLayout;
```

### B. Profile Section Component

```jsx
// ProfileSection.jsx
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, X, CheckCircle } from 'lucide-react';

const ProfileSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: 'John Smith',
    email: 'john.smith@email.com',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    phoneVerified: true,
    location: 'New York, NY',
    bio: 'Travel enthusiast and adventure seeker',
    avatar: null,
    memberSince: '2023-01-15'
  });

  const [editForm, setEditForm] = useState({ ...user });

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
    // Show success message
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Profile Information</h1>
          <p style={styles.subtitle}>
            Manage your personal information and how others see you
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={styles.editButton}
            className="clickable"
          >
            <User size={18} />
            Edit Profile
          </button>
        ) : (
          <div style={styles.actions}>
            <button
              onClick={handleCancel}
              style={styles.cancelButton}
              className="clickable"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={styles.saveButton}
              className="clickable"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div style={styles.card}>
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {editForm.avatar ? (
                <img src={editForm.avatar} alt="Avatar" style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarText}>{getInitials(user.name)}</span>
              )}
            </div>

            {isEditing && (
              <label style={styles.avatarOverlay} className="clickable">
                <Camera size={24} color="#ffffff" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={styles.fileInput}
                />
              </label>
            )}
          </div>

          <div style={styles.avatarInfo}>
            <h3 style={styles.userName}>{user.name}</h3>
            <p style={styles.memberSince}>
              Member since {new Date(user.memberSince).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Form Fields */}
        <div style={styles.formGrid}>
          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label}>
              <User size={18} color="#10b981" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={styles.input}
                placeholder="Enter your full name"
              />
            ) : (
              <p style={styles.value}>{user.name}</p>
            )}
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>
              <Mail size={18} color="#3b82f6" />
              Email Address
              {user.emailVerified && (
                <span style={styles.verified}>
                  <CheckCircle size={16} color="#10b981" />
                  Verified
                </span>
              )}
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={styles.input}
                placeholder="Enter your email"
              />
            ) : (
              <p style={styles.value}>{user.email}</p>
            )}
          </div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label}>
              <Phone size={18} color="#8b5cf6" />
              Phone Number
              {user.phoneVerified && (
                <span style={styles.verified}>
                  <CheckCircle size={16} color="#10b981" />
                  Verified
                </span>
              )}
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                style={styles.input}
                placeholder="Enter your phone number"
              />
            ) : (
              <p style={styles.value}>{user.phone}</p>
            )}
          </div>

          {/* Location */}
          <div style={styles.field}>
            <label style={styles.label}>
              <MapPin size={18} color="#f59e0b" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                style={styles.input}
                placeholder="Enter your location"
              />
            ) : (
              <p style={styles.value}>{user.location}</p>
            )}
          </div>

          {/* Bio (Full Width) */}
          <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <label style={styles.label}>
              <User size={18} color="#10b981" />
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                placeholder="Tell us about yourself"
              />
            ) : (
              <p style={styles.value}>{user.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: '#ffffff',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarText: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#ffffff',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  fileInput: {
    display: 'none',
  },
  avatarInfo: {},
  userName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  memberSince: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '2rem 0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  field: {},
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  verified: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    color: '#1f2937',
    transition: 'all 0.2s ease',
  },
  value: {
    fontSize: '1rem',
    color: '#1f2937',
    padding: '0.75rem 0',
  },
};

export default ProfileSection;
```

---

## 11. Conclusion & Next Steps

### Summary
This research document provides a comprehensive analysis of account page design patterns from industry leaders (Booking.com, Airbnb, Discord) and translates those insights into actionable recommendations for the HoP travel booking platform.

### Key Takeaways
1. **Navigation**: Sidebar navigation provides the best scalability and professional appearance
2. **Security**: Two-factor authentication and session management are must-have features
3. **User Experience**: Inline editing, clear validation, and success feedback are critical
4. **Design System**: Consistent use of your green theme (#10b981) across all components
5. **Accessibility**: WCAG 2.1 AA compliance ensures inclusive design

### Implementation Priority
1. **High Priority** (Weeks 1-3):
   - Profile section with avatar upload
   - Security settings (password, 2FA, sessions)
   - Basic notifications preferences

2. **Medium Priority** (Weeks 4-5):
   - Payment methods (if not already implemented)
   - Privacy settings
   - Rewards/loyalty display

3. **Low Priority** (Week 6+):
   - Activity history
   - Advanced preferences
   - Analytics/insights

### Resources Needed
- UI/UX designer for mockups (optional, if not using these specs)
- Frontend developer(s) for implementation
- Backend developer for API endpoints
- QA tester for accessibility and cross-browser testing
- Security audit for 2FA and session management

### Recommended Libraries/Tools
```json
{
  "frontend": {
    "ui-components": "lucide-react (icons)",
    "forms": "react-hook-form",
    "validation": "yup or zod",
    "notifications": "react-toastify",
    "image-crop": "react-easy-crop",
    "qr-code": "qrcode.react"
  },
  "backend": {
    "2fa": "speakeasy (Node.js)",
    "qr-generation": "qrcode (Node.js)",
    "session-management": "express-session + connect-mongo",
    "rate-limiting": "express-rate-limit"
  },
  "testing": {
    "unit": "jest + react-testing-library",
    "e2e": "cypress or playwright",
    "accessibility": "axe-core, pa11y"
  }
}
```

---

## Appendix: Additional Resources

### Design Inspiration
- Dribbble: Search "account settings UI"
- Behance: Search "profile page design"
- Figma Community: Account settings templates

### Accessibility Guidelines
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM: https://webaim.org/resources/

### Security Best Practices
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- 2FA Guidelines: https://www.nist.gov/itl/applied-cybersecurity/tig/back-basics-multi-factor-authentication

### Component Libraries (Optional)
- Tailwind UI: Pre-built components
- shadcn/ui: Accessible components
- Headless UI: Unstyled accessible components

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Author**: Claude (AI Assistant)
**For**: HoP (House of Paradise) Travel Booking Platform
