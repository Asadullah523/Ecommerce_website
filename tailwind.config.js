/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    900: '#0d1117', // MIDNIGHT_CARBON_BASE
                    800: '#161b22', // SURFACE_MID
                    700: '#21262d', // SURFACE_LIGHT
                    600: '#30363d', // BORDER_SOFT
                },
                panel: '#161b22',
                accent: {
                    cyan: '#06b6d4',
                    pink: '#ec4899',
                    purple: '#7c3aed',
                },
                muted: '#9aa7b4',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'blob': 'blobPulse 6s ease-in-out infinite',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
            },
            keyframes: {
                blobPulse: {
                    '0%, 100%': { transform: 'scale(0.95) translateY(0)', opacity: '.14' },
                    '50%': { transform: 'scale(1.08) translateY(8px)', opacity: '.22' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
