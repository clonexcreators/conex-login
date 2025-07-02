/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Core lab components
    'lab-button-primary',
    'lab-button-secondary',
    'lab-button-outline',
    'lab-surface',
    'lab-surface-elevated',
    'lab-input',
    'lab-badge',
    'lab-badge-primary',
    'lab-badge-accent',
    'lab-badge-danger',
    'lab-profile-badge',
    'research-panel',
    'dna-scanner',
    'scanline-effect',
    'input-group',
    'border-pulse',
    'data-grid',
    
    // Typography classes
    'lab-heading-xl',
    'lab-heading-lg',
    'lab-heading-md',
    'lab-text',
    'lab-text-sm',
    
    // Utility classes
    'no-shadow',
    'geometric-lab',
    
    // Status indicators
    'status-online',
    'status-offline',
    'status-processing',
    
    // Add more specific background and text color classes
    'bg-\\[\\#FF5AF7\\]',
    'bg-\\[\\#00C2FF\\]',
    'bg-\\[\\#6EFFC7\\]',
    'bg-\\[\\#1C1C1C\\]',
    'bg-\\[\\#F5F5F5\\]',
    'bg-\\[\\#FAFAF0\\]',
    'bg-\\[\\#4A4A4A\\]',
    'bg-\\[\\#FF3B3B\\]',
    'bg-\\[\\#00D26A\\]',
    'bg-\\[\\#FFB800\\]',
    
    // Text colors
    'text-\\[\\#FF5AF7\\]',
    'text-\\[\\#00C2FF\\]',
    'text-\\[\\#6EFFC7\\]',
    'text-\\[\\#1C1C1C\\]', 
    'text-\\[\\#4A4A4A\\]',
    'text-\\[\\#FF3B3B\\]',
    'text-\\[\\#00D26A\\]',
    
    // Border colors
    'border-\\[\\#1C1C1C\\]',
    'border-\\[\\#FF5AF7\\]',
    'border-\\[\\#00C2FF\\]',
    'border-\\[\\#6EFFC7\\]',
    
    // Scale and transform classes used in hover effects
    'scale-105',
    'scale-110',
    'rotate-1',
    'rotate-45',
    '-rotate-1',
    
    // All pattern variations with their modifiers
    'transform',
    'transition-all',
    'transition-colors',
    'transition-transform',
    'duration-150',
    'duration-200',
    'hover:scale-105',
    'hover:scale-110',
    'hover:bg-\\[\\#1C1C1C\\]',
    'hover:text-white',
    'hover:border-\\[\\#FF3B3B\\]'
  ],
  theme: {
    extend: {
      colors: {
        'hot-pink': '#FF2D75',
        'bubblegum-pink': '#FF85B3',
        'mint-teal': '#34EEDC',
        'cool-teal': '#27C3B6',
        'sky-blue': '#87CEFA',
        'neutral-white': '#F9F9F9',
      },
      fontFamily: {
        'black': ['system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}