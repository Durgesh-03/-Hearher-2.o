import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary dark theme
                dark: {
                    900: '#0a0e1a',
                    800: '#0f1629',
                    700: '#151d35',
                    600: '#1b2541',
                    500: '#212d4d',
                },
                // Accent colors
                cyan: {
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                },
                emerald: {
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                },
                danger: {
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                },
                warning: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.05)',
                    medium: 'rgba(255, 255, 255, 0.08)',
                    heavy: 'rgba(255, 255, 255, 0.12)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
            },
            backdropBlur: {
                xs: '2px',
                glass: '16px',
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'pulse-fast': 'pulse 1s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'shake': 'shake 0.5s ease-in-out',
                'float': 'float 3s ease-in-out infinite',
                'ripple': 'ripple 1.5s ease-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                ripple: {
                    '0%': { transform: 'scale(0.8)', opacity: '1' },
                    '100%': { transform: 'scale(2.4)', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
