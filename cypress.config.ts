import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    setupNodeEvents(_on, _config) {
      // Implement node event listeners here.
    },
  },
});
