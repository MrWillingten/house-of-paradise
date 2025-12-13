# TwoFactorAuth Component - Setup Guide

## Overview
A fully functional Two-Factor Authentication (2FA/MFA) React component inspired by Discord's implementation. This component provides a complete setup wizard, backup codes management, and SMS fallback options with a beautiful dark-mode UI.

## Prerequisites

### Required Package Installation
Before using this component, you must install the QR code library:

```bash
npm install qrcode.react
```

The following packages are already included in the project:
- `lucide-react` (icons)
- `axios` (API calls)
- `react` & `react-dom`

## Features

### 1. Enable/Disable Toggle
- Display current 2FA status with visual indicators
- Enable button initiates the setup flow
- Disable button with password confirmation for security

### 2. Setup Flow (3-Step Wizard)
- **Step 1: QR Code Generation**
  - Display QR code for authenticator apps
  - Manual secret key entry option
  - Instructions for Google Authenticator, Authy, Microsoft Authenticator, 1Password
  - Copy secret key to clipboard

- **Step 2: Verification**
  - Enter 6-digit code from authenticator app
  - Real-time code validation
  - Error handling with user feedback

- **Step 3: Backup Codes**
  - Display 10 backup codes in a grid
  - Download as text file
  - Copy to clipboard
  - Warning about saving codes securely

### 3. Backup Codes Management
- View remaining backup codes count
- Regenerate backup codes with confirmation
- Download backup codes as `.txt` file
- Copy all codes to clipboard
- Visual feedback for actions

### 4. SMS Fallback Option
- Optional SMS backup for additional security
- Phone number input with validation
- Toggle SMS backup on/off
- Send test SMS button
- Only visible when 2FA is enabled

### 5. UI/UX Features
- Dark mode design (gray-900 background)
- Green theme (#10b981) for success states
- Beautiful modal/card design with smooth transitions
- Step-by-step wizard with progress indicator
- Success/error messages with auto-dismiss
- Loading states for all async operations
- Responsive design for mobile and desktop
- Accessible form controls

## API Integration

The component integrates with the following endpoints:

### Required Backend Endpoints

```javascript
// Check 2FA status
GET /api/auth/2fa-status
Headers: { Authorization: 'Bearer <token>' }
Response: {
  enabled: boolean,
  remainingBackupCodes: number,
  smsEnabled: boolean,
  phoneNumber: string
}

// Start 2FA setup - Generate QR code
POST /api/auth/setup-2fa
Headers: { Authorization: 'Bearer <token>' }
Response: {
  qrCodeUrl: string,  // otpauth://totp/...
  secret: string      // Base32 encoded secret
}

// Verify 2FA code
POST /api/auth/verify-2fa
Headers: { Authorization: 'Bearer <token>' }
Body: { code: string }
Response: {
  success: boolean,
  backupCodes: string[]  // Array of 10 backup codes
}

// Disable 2FA
POST /api/auth/disable-2fa
Headers: { Authorization: 'Bearer <token>' }
Body: { password: string }
Response: {
  success: boolean,
  message: string
}

// Get backup codes
GET /api/auth/backup-codes
Headers: { Authorization: 'Bearer <token>' }
Response: {
  backupCodes: string[]
}

// Regenerate backup codes
POST /api/auth/regenerate-codes
Headers: { Authorization: 'Bearer <token>' }
Response: {
  backupCodes: string[]
}

// Toggle SMS backup (optional)
POST /api/auth/toggle-sms-backup
Headers: { Authorization: 'Bearer <token>' }
Body: {
  enabled: boolean,
  phoneNumber: string
}
Response: {
  success: boolean,
  message: string
}

// Send test SMS (optional)
POST /api/auth/send-test-sms
Headers: { Authorization: 'Bearer <token>' }
Body: { phoneNumber: string }
Response: {
  success: boolean,
  message: string
}
```

## Usage

### Basic Integration

```jsx
import React from 'react';
import TwoFactorAuth from './components/TwoFactorAuth';

function AccountSettingsPage() {
  return (
    <div>
      <TwoFactorAuth />
    </div>
  );
}

export default AccountSettingsPage;
```

### With React Router

```jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TwoFactorAuth from './components/TwoFactorAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/settings/security" element={<TwoFactorAuth />} />
      </Routes>
    </Router>
  );
}
```

### Authentication Requirements

The component expects a JWT token to be stored in `localStorage`:

```javascript
// After login, store the token
localStorage.setItem('token', yourJWTToken);

// The component will automatically read it for API calls
```

## Component State Management

The component manages the following state:

```javascript
// 2FA Status
- is2FAEnabled: boolean
- remainingBackupCodes: number
- smsEnabled: boolean
- phoneNumber: string

// Setup Flow
- showSetupModal: boolean
- currentStep: 1 | 2 | 3
- qrCodeUrl: string
- secretKey: string
- verificationCode: string
- backupCodes: string[]

// Modals
- showDisableModal: boolean
- showBackupCodesModal: boolean

// UI State
- isLoading: boolean
- message: { type: 'success' | 'error', text: string }
- copied: boolean
- copiedSecret: boolean
```

## Styling

The component uses Tailwind CSS classes. Ensure Tailwind is configured in your project:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      }
    },
  },
  plugins: [],
}
```

If Tailwind is not configured, you can add it:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Security Considerations

1. **JWT Token Storage**: Tokens are stored in localStorage. For production, consider using httpOnly cookies.

2. **Password Confirmation**: Disabling 2FA requires password confirmation.

3. **Backup Codes**: Each backup code can only be used once. Users are warned to store them securely.

4. **QR Code Display**: QR codes are displayed over HTTPS only in production.

5. **Rate Limiting**: Backend should implement rate limiting on 2FA endpoints.

6. **Secret Key Security**: The secret key is only shown during setup and should never be logged.

## Customization

### Change Theme Color

Replace all instances of `green-` classes with your preferred color:

```javascript
// Example: Change to blue theme
'bg-green-600' → 'bg-blue-600'
'text-green-400' → 'text-blue-400'
'border-green-500' → 'border-blue-500'
```

### Modify Backup Codes Count

The default is 10 backup codes. To change:

```javascript
// In backend API response, return different number of codes
Response: { backupCodes: string[] } // Array of N codes
```

### Add Additional Authenticator Apps

Edit the supported apps list in Step 1:

```javascript
{[
  'Google Authenticator',
  'Authy',
  'Microsoft Authenticator',
  '1Password',
  'Your Custom App', // Add here
].map((app) => (
  // ...
))}
```

## Troubleshooting

### QR Code Not Displaying
- Ensure `qrcode.react` is installed: `npm install qrcode.react`
- Check that the API returns a valid `otpauth://` URL
- Verify the QRCodeSVG import: `import { QRCodeSVG } from 'qrcode.react';`

### API Calls Failing
- Check that the JWT token exists in localStorage
- Verify the API endpoints match your backend routes
- Check CORS configuration in your backend
- Look for errors in browser console and network tab

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that the Tailwind content paths include your components
- Run `npm run build` to regenerate Tailwind classes

### Modal Not Opening
- Check browser console for JavaScript errors
- Verify state management in parent components
- Ensure z-index is not conflicting with other elements

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Opera: Full support

Requires JavaScript enabled and supports modern ES6+ features.

## Testing

### Manual Testing Checklist

1. **Enable 2FA**
   - [ ] Click "Enable Two-Factor Auth" button
   - [ ] QR code displays correctly
   - [ ] Secret key can be copied
   - [ ] 6-digit code verification works
   - [ ] Backup codes are displayed
   - [ ] Can download backup codes
   - [ ] Can copy backup codes
   - [ ] Setup completes successfully

2. **Disable 2FA**
   - [ ] Click "Disable 2FA" button
   - [ ] Password confirmation required
   - [ ] Correct password disables 2FA
   - [ ] Wrong password shows error

3. **Backup Codes**
   - [ ] Can view backup codes
   - [ ] Can download backup codes
   - [ ] Can copy backup codes
   - [ ] Can regenerate backup codes
   - [ ] Regeneration requires confirmation

4. **SMS Backup**
   - [ ] Can enter phone number
   - [ ] Can enable SMS backup
   - [ ] Can send test SMS
   - [ ] Can disable SMS backup

5. **UI/UX**
   - [ ] Loading states display correctly
   - [ ] Success messages appear and auto-dismiss
   - [ ] Error messages display properly
   - [ ] Modals can be closed
   - [ ] Responsive on mobile
   - [ ] Dark mode theme consistent

## Backend Implementation Example (Node.js)

Here's a basic example of how to implement the backend:

```javascript
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');

// Setup 2FA
app.post('/api/auth/setup-2fa', authenticateToken, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `TravelBooking (${req.user.email})`,
    length: 32
  });

  const qrCodeUrl = secret.otpauth_url;

  // Store secret.base32 in user's database record (encrypted)
  await User.findByIdAndUpdate(req.user.id, {
    twoFactorSecret: secret.base32,
    twoFactorTempSecret: secret.base32 // Temporary until verified
  });

  res.json({
    qrCodeUrl: qrCodeUrl,
    secret: secret.base32
  });
});

// Verify 2FA
app.post('/api/auth/verify-2fa', authenticateToken, async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user.id);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ message: 'Invalid code' });
  }

  // Generate backup codes
  const backupCodes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    backupCodes.push(code);
  }

  // Hash and store backup codes
  const hashedCodes = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 10))
  );

  await User.findByIdAndUpdate(req.user.id, {
    twoFactorEnabled: true,
    twoFactorSecret: user.twoFactorTempSecret,
    backupCodes: hashedCodes,
    twoFactorTempSecret: null
  });

  res.json({ success: true, backupCodes });
});

// Additional endpoints follow similar patterns...
```

## License

This component is part of the Travel Booking Microservices project.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend API responses in browser DevTools
3. Verify all dependencies are installed
4. Check console for error messages

## Version History

- **v1.0.0** (2025-12-07): Initial release
  - Complete setup wizard
  - Backup codes management
  - SMS fallback option
  - Dark mode UI with green theme
  - Full Discord-inspired feature set
