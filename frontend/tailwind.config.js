/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgBase: '#0b0f19',
        bgDeep: '#070a13',
        surfaceGlass: 'rgba(255,255,255,0.03)',
        borderGlass: 'rgba(0,242,254,0.15)',
        glowShadowBase: 'rgba(0,242,254,0.2)',
        
        serviceCyanStart: '#00f2fe',
        serviceCyanEnd: '#4facfe',
        
        classEmeraldStart: '#00ff87',
        classEmeraldEnd: '#60efff',
        
        dbVioletStart: '#7f00ff',
        dbVioletEnd: '#e100ff',
        
        kafkaAmberStart: '#ff0844',
        kafkaAmberEnd: '#ffb199',
        
        packageGrayStart: '#2a3142',
        packageGrayEnd: '#3d4a5c',

        blastRed: '#ff0055',
        warningAmber: '#ffb347',
        successGreen: '#00ff87'
      },
      backgroundImage: {
        'gradient-service': 'linear-gradient(to right, #00f2fe, #4facfe)',
        'gradient-class': 'linear-gradient(to right, #00ff87, #60efff)',
        'gradient-db': 'linear-gradient(to right, #7f00ff, #e100ff)',
        'gradient-kafka': 'linear-gradient(to right, #ff0844, #ffb199)',
        'gradient-package': 'linear-gradient(to right, #2a3142, #3d4a5c)',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
