import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        globals: true
    }
})
