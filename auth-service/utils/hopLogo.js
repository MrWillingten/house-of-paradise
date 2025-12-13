/**
 * House of Paradise - SVG Logo for Email Embedding
 *
 * This creates an inline SVG that works in all email clients
 * without requiring external image hosting.
 */

// HoP Logo as inline SVG (house with palm frond - emerald green)
const HOP_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <!-- Background -->
  <rect width="120" height="120" rx="16" fill="#1a1a1a"/>

  <!-- House outline -->
  <path d="M60 20 L95 50 L95 95 L25 95 L25 50 Z"
        fill="none"
        stroke="#10b981"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"/>

  <!-- House base line -->
  <path d="M25 95 L95 95"
        stroke="#10b981"
        stroke-width="4"
        stroke-linecap="round"/>

  <!-- Palm frond - main stem -->
  <path d="M40 85 Q45 60 55 45"
        fill="none"
        stroke="#10b981"
        stroke-width="3"
        stroke-linecap="round"/>

  <!-- Palm frond - leaves -->
  <path d="M45 70 Q35 65 30 55"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>
  <path d="M48 62 Q38 58 32 48"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>
  <path d="M52 55 Q45 50 40 42"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>
  <path d="M55 48 Q52 42 50 35"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>

  <!-- Palm frond - right side leaves -->
  <path d="M50 65 Q60 60 70 58"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>
  <path d="M53 57 Q63 52 73 48"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>
  <path d="M55 50 Q62 46 70 42"
        fill="none"
        stroke="#10b981"
        stroke-width="2.5"
        stroke-linecap="round"/>
</svg>
`;

// Base64 encoded SVG for email embedding
const HOP_LOGO_BASE64 = Buffer.from(HOP_LOGO_SVG.trim()).toString('base64');

// Data URI for direct embedding in img src
const HOP_LOGO_DATA_URI = `data:image/svg+xml;base64,${HOP_LOGO_BASE64}`;

// Smaller version for footer (60x60)
const HOP_LOGO_SVG_SMALL = HOP_LOGO_SVG.replace('width="120" height="120"', 'width="60" height="60"');
const HOP_LOGO_BASE64_SMALL = Buffer.from(HOP_LOGO_SVG_SMALL.trim()).toString('base64');
const HOP_LOGO_DATA_URI_SMALL = `data:image/svg+xml;base64,${HOP_LOGO_BASE64_SMALL}`;

module.exports = {
  HOP_LOGO_SVG,
  HOP_LOGO_BASE64,
  HOP_LOGO_DATA_URI,
  HOP_LOGO_SVG_SMALL,
  HOP_LOGO_BASE64_SMALL,
  HOP_LOGO_DATA_URI_SMALL
};
