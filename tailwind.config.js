/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#FF4400',
                    secondary: '#1F2ADE',
                    positive: '#00C472',
                    negative: '#FF3B30',
                    warning: '#F2BB05'
                },
                zapier: {
                    orange: '#FF4400', // Mapped to primary
                    black: '#1D1D1D',
                    hover: '#F5F5F5',
                    border: '#E0E0E0',
                    purple: '#1F2ADE' // Mapped to secondary (was purple, now blueish)
                }
            },
            fontFamily: {
                sans: ['Urbanist', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
