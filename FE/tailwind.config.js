/** @type {import('tailwindcss').Config} */
export default {
    // Chỉ điểm cho Tailwind biết file mô cần quét
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}