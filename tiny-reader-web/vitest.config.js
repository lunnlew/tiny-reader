// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',  // Needed for DOM-related tests
    setupFiles: ['./tests/setup.js'],  // Optional setup file
  },
})