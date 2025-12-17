/**
 * Discord-Inspired Color Palette
 * 
 * This file contains all colors used throughout the workshop management app.
 * Colors are organized by purpose and hierarchy to maintain consistency.
 * 
 * Usage:
 * import { colors } from '@/theme/colors';
 * className={`bg-[${colors.background.primary}]`}
 */

export const colors = {
  // ============================================
  // BACKGROUND COLORS
  // ============================================
  background: {
    primary: '#000000',      // Main app background (darkest)
    secondary: '#070709',     // Content panels, cards
    tertiary: '#0C0C0E',      // Elevated cards, inputs
    quaternary: '#1e1e1e',    // Nested elements
    hover: '#2a2a2a',         // Hover state for interactive elements
    active: '#2b2d31',        // Active/selected state
    elevated: '#2b2d31',      // Elevated content (modals, dropdowns)
    input: '#383a40',         // Input fields, text areas
  },

  // ============================================
  // TEXT COLORS
  // ============================================
  text: {
    primary: '#ffffff',       // Headings, important text
    secondary: '#dcddde',     // Body text, labels
    tertiary: '#b5bac1',      // Supporting text
    muted: '#949ba4',         // De-emphasized text
    disabled: '#6d6f78',      // Disabled state text
    placeholder: '#6d6f78',   // Input placeholders
    link: '#00a8fc',          // Links (Discord blue)
    linkHover: '#00c7fc',     // Link hover state
  },

  // ============================================
  // BORDER COLORS
  // ============================================
  border: {
    default: '#26282c',       // Default border (very subtle)
    light: '#3f4147',         // Slightly more visible borders
    medium: '#4e5058',        // Medium contrast borders
    heavy: '#5c5f66',         // High contrast borders
    focus: '#5865f2',         // Focus state (blurple)
    active: '#5865f2',        // Active element border
  },

  // ============================================
  // ACCENT COLORS (Primary Branding)
  // ============================================
  accent: {
    blurple: {
      DEFAULT: '#5865f2',     // Discord's primary brand color
      hover: '#4752c4',       // Hover state
      active: '#3c45a5',      // Active/pressed state
      muted: '#5865f233',     // 20% opacity for backgrounds
    },
    green: {
      DEFAULT: '#3ba55d',     // Success, admitted status
      hover: '#2d7d46',       // Hover state
      active: '#26693d',      // Active state
      muted: '#3ba55d33',     // 20% opacity
    },
    red: {
      DEFAULT: '#ed4245',     // Error, danger, absent status
      hover: '#c03537',       // Hover state
      active: '#a12d2f',      // Active state
      muted: '#ed424533',     // 20% opacity
    },
    yellow: {
      DEFAULT: '#faa61a',     // Warning, early leave status
      hover: '#e09013',       // Hover state
      active: '#c27e10',      // Active state
      muted: '#faa61a33',     // 20% opacity
    },
    purple: {
      DEFAULT: '#593695',     // Purple accent for variety
      hover: '#4a2d7a',       // Hover state
      active: '#3d2563',      // Active state
      muted: '#59369533',     // 20% opacity
    },
  },

  // ============================================
  // STATUS COLORS (Semantic)
  // ============================================
  status: {
    online: '#3ba55d',        // Online/Active/Admitted
    idle: '#faa61a',          // Idle/Warning/Left Early
    dnd: '#ed4245',           // Do Not Disturb/Error/Absent
    offline: '#747f8d',       // Offline/Inactive/Pending
    invisible: '#5c5f66',     // Invisible/Disabled
    streaming: '#593695',     // Streaming (purple)
  },

  // ============================================
  // INTERACTIVE STATES
  // ============================================
  interactive: {
    normal: '#dcddde',        // Default interactive element
    hover: '#ffffff',         // Hovered interactive element
    active: '#ffffff',        // Active/clicked interactive element
    muted: '#949ba4',         // Muted/secondary interactive
    subtle: '#4e5058',        // Very subtle interactive elements
  },

  // ============================================
  // SIDEBAR SPECIFIC
  // ============================================
  sidebar: {
    background: '#111111',    // Sidebar background
    hover: '#202122',         // Hover state in sidebar
    active: '#404249',        // Active menu item
    activeIndicator: '#5865f2', // Active indicator (left border)
    text: '#949ba4',          // Sidebar text
    textHover: '#dcddde',     // Sidebar text on hover
    textActive: '#ffffff',    // Active sidebar text
  },

  // ============================================
  // MIDDLE PANEL SPECIFIC
  // ============================================
  middlePanel: {
    background: '#1e1e1e',    // Middle panel background
    hover: '#35373c',         // List item hover
    active: '#404249',        // Selected list item
    border: '#26282c',        // Divider borders
    header: '#111111',        // Panel header background
  },

  // ============================================
  // MODAL/OVERLAY COLORS
  // ============================================
  modal: {
    backdrop: '#000000d9',    // Modal backdrop (85% opacity)
    background: '#2b2d31',    // Modal content background
    header: '#1e1f22',        // Modal header background
    footer: '#2b2d31',        // Modal footer background
  },

  // ============================================
  // BUTTON COLORS (by type)
  // ============================================
  button: {
    primary: {
      bg: '#5865f2',
      bgHover: '#4752c4',
      bgActive: '#3c45a5',
      text: '#ffffff',
    },
    success: {
      bg: '#3ba55d',
      bgHover: '#2d7d46',
      bgActive: '#26693d',
      text: '#ffffff',
    },
    danger: {
      bg: '#ed4245',
      bgHover: '#c03537',
      bgActive: '#a12d2f',
      text: '#ffffff',
    },
    warning: {
      bg: '#faa61a',
      bgHover: '#e09013',
      bgActive: '#c27e10',
      text: '#000000',
    },
    secondary: {
      bg: '#4e5058',
      bgHover: '#5c5f66',
      bgActive: '#6c6f75',
      text: '#ffffff',
    },
    ghost: {
      bg: 'transparent',
      bgHover: '#3f4147',
      bgActive: '#4e5058',
      text: '#dcddde',
    },
  },

  // ============================================
  // GRADIENT BACKGROUNDS (sparingly used)
  // ============================================
  gradient: {
    blurple: 'linear-gradient(90deg, #5865f2 0%, #4752c4 100%)',
    green: 'linear-gradient(90deg, #3ba55d 0%, #2d7d46 100%)',
    premium: 'linear-gradient(90deg, #593695 0%, #5865f2 50%, #04befe 100%)',
    purple: 'linear-gradient(135deg, #593695 0%, #7c3aed 100%)',
  },

  // ============================================
  // GLOW EFFECTS (for active elements)
  // ============================================
  glow: {
    blurple: '0 0 8px rgba(88, 101, 242, 0.6), 0 0 16px rgba(88, 101, 242, 0.3)',
    green: '0 0 8px rgba(59, 165, 93, 0.6), 0 0 16px rgba(59, 165, 93, 0.3)',
    red: '0 0 8px rgba(237, 66, 69, 0.6), 0 0 16px rgba(237, 66, 69, 0.3)',
    yellow: '0 0 8px rgba(250, 166, 26, 0.6), 0 0 16px rgba(250, 166, 26, 0.3)',
    purple: '0 0 8px rgba(89, 54, 149, 0.6), 0 0 16px rgba(89, 54, 149, 0.3)',
  },

  // ============================================
  // SCROLLBAR COLORS
  // ============================================
  scrollbar: {
    track: '#0e0e0e',         // Scrollbar track
    thumb: '#1a1a1a',         // Scrollbar thumb
    thumbHover: '#2a2a2a',    // Scrollbar thumb hover
  },

  // ============================================
  // CERTIFICATE SPECIFIC (legacy compatibility)
  // ============================================
  certificate: {
    // These are kept for certificate generation
    // but UI should use Discord colors above
    white: '#ffffff',
    ivory: '#fffff0',
    snow: '#fffafa',
    ghostWhite: '#f8f8ff',
  },
};

/**
 * Helper function to apply opacity to hex colors
 * @param {string} hexColor - Hex color code (e.g., '#5865f2')
 * @param {number} opacity - Opacity value 0-1 (e.g., 0.5 for 50%)
 * @returns {string} - Hex color with opacity (e.g., '#5865f280')
 */
export function withOpacity(hexColor, opacity) {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hexColor}${alpha}`;
}

/**
 * Status color mapping for participant states
 */
export const participantStatusColors = {
  pending: colors.status.offline,      // Gray dot
  admitted: colors.status.online,      // Green dot
  left_early: colors.status.idle,      // Yellow dot
  absent: colors.status.dnd,           // Red dot
};

/**
 * Workshop state colors
 */
export const workshopStateColors = {
  idle: colors.status.offline,         // Gray
  active: colors.status.online,        // Green
  finished: colors.accent.blurple.DEFAULT, // Blurple
  paused: colors.status.idle,          // Yellow
};

export default colors;
