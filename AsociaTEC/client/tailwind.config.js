/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Roboto',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    '"Helvetica Neue"',
                    'Arial',
                    '"Noto Sans"',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
                serif: [
                    '"Roboto Slab"',
                    '"Source Serif Pro"',
                    'ui-serif',
                    'Georgia',
                    'Cambria',
                    '"Times New Roman"',
                    'Times',
                    'serif',
                ],
                mono: [
                    '"Roboto Mono"',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    '"Liberation Mono"',
                    '"Courier New"',
                    'monospace',
                  ],
            },
            colors: {
                'venice-blue': {
                    '50': '#eff8ff',
                    '100': '#def0ff',
                    '200': '#b6e3ff',
                    '300': '#76ceff',
                    '400': '#2db7ff',
                    '500': '#029ef5',
                    '600': '#007dd2',
                    '700': '#0064aa',
                    '800': '#005085',
                    '900': '#074673',
                    '950': '#042c4d',
                },
            }
        },
    },
    plugins: [],
};
