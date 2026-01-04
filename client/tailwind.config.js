/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#059669', // Emerald 600
                'primary-hover': '#047857', // Emerald 700
                'primary-light': '#ECFDF5', // Emerald 50
                secondary: '#64748B', // Slate 500
                background: '#F1F5F9', // Slate 100
                surface: '#FFFFFF',
                'text-main': '#0F172A', // Slate 900
                'text-secondary': '#64748B', // Slate 500
                success: '#10B981', // Emerald 500
                warning: '#F59E0B', // Amber 500
                danger: '#EF4444', // Red 500
                border: '#E2E8F0', // Slate 200

                // Dark Mode Colors
                'dark-background': '#0F172A', // Slate 900
                'dark-surface': '#1E293B', // Slate 800
                'dark-border': '#334155', // Slate 700
                'dark-text-main': '#F8FAFC', // Slate 50
                'dark-text-secondary': '#94A3B8', // Slate 400
            },
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '12px',
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
