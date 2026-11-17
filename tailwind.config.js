/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en la bandera sorda oficial (WFD, 2023):
        // azul oscuro + turquesa (comunidad sorda y lengua de señas) + amarillo (luz).
        // Contraste WCAG AA verificado.
        primary: {
          50: '#EEF4FF',
          100: '#DCE7FB',
          200: '#B9CEF5',
          300: '#8BAEEB',
          400: '#5C89DB',
          500: '#2F64C2',
          600: '#1B4596',
          700: '#153575',
          800: '#10285A',
          900: '#0A1A3D',
        },
        accent: {
          50: '#E6FAFA',
          100: '#C3F2F2',
          200: '#8EE6E6',
          300: '#4FD4D6',
          400: '#22B8BC',
          500: '#0E7C80',
          600: '#0B6A6E',
          700: '#095558',
          800: '#07403F',
          900: '#042A2A',
        },
        gold: {
          200: '#FFE7A3',
          300: '#FFD86B',
          400: '#FFC93C',
          500: '#F2B01E',
        },
        night: '#061633',
        canvas: '#F5F8FC',
        pending: {
          bg: '#fef3c7',
          fg: '#92400e',
          border: '#fcd34d',
        },
        assigned: {
          bg: '#dbeafe',
          fg: '#1e40af',
          border: '#93c5fd',
        },
        confirmed: {
          bg: '#dcfce7',
          fg: '#166534',
          border: '#86efac',
        },
        served: {
          bg: '#e2e8f0',
          fg: '#334155',
          border: '#94a3b8',
        },
        cancelled: {
          bg: '#fee2e2',
          fg: '#991b1b',
          border: '#fca5a5',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', '"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(16, 40, 90, 0.06), 0 1px 2px rgba(16, 40, 90, 0.05)',
        card: '0 10px 30px -8px rgba(16, 40, 90, 0.18), 0 2px 6px rgba(16, 40, 90, 0.06)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px -15px rgba(34, 184, 188, 0.45)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
