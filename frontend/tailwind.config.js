/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Discord color palette
        discord: {
          // Backgrounds
          'bg-primary': '#0e0e0e',
          'bg-secondary': '#111111',
          'bg-tertiary': '#1a1a1a',
          'bg-quaternary': '#1e1e1e',
          'bg-hover': '#2a2a2a',
          'bg-active': '#2b2d31',
          'bg-elevated': '#2b2d31',
          'bg-input': '#383a40',
          
          // Text
          'text-primary': '#ffffff',
          'text-secondary': '#dcddde',
          'text-tertiary': '#b5bac1',
          'text-muted': '#949ba4',
          'text-disabled': '#6d6f78',
          
          // Borders
          'border-default': '#26282c',
          'border-light': '#3f4147',
          'border-medium': '#4e5058',
          'border-heavy': '#5c5f66',
          
          // Accents
          'blurple': '#5865f2',
          'blurple-hover': '#4752c4',
          'blurple-active': '#3c45a5',
          'green': '#3ba55d',
          'green-hover': '#2d7d46',
          'green-active': '#26693d',
          'red': '#ed4245',
          'red-hover': '#c03537',
          'red-active': '#a12d2f',
          'yellow': '#faa61a',
          'yellow-hover': '#e09013',
          'yellow-active': '#c27e10',
          
          // Status
          'status-online': '#3ba55d',
          'status-idle': '#faa61a',
          'status-dnd': '#ed4245',
          'status-offline': '#747f8d',
          
          // Sidebar
          'sidebar-bg': '#111111',
          'sidebar-hover': '#202122',
          'sidebar-active': '#404249',
          
          // Middle Panel
          'panel-bg': '#1e1e1e',
          'panel-hover': '#35373c',
          'panel-active': '#404249',
          
          // Modal
          'modal-backdrop': '#000000d9',
          'modal-bg': '#2b2d31',
          'modal-header': '#1e1f22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      spacing: {
        // Discord uses 8px increments
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '17': '68px',
        '18': '72px',
        '70': '280px', // Middle panel width
      },
      borderRadius: {
        'discord': '4px',
        'discord-lg': '8px',
        'discord-xl': '12px',
      },
      boxShadow: {
        'discord': '0 2px 10px 0 rgba(0, 0, 0, 0.2)',
        'discord-lg': '0 8px 16px rgba(0, 0, 0, 0.24)',
        'discord-xl': '0 16px 24px rgba(0, 0, 0, 0.4)',
      },
      transitionDuration: {
        'discord': '150ms',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-in',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
