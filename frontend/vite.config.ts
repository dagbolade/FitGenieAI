import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'crypto.getRandomValues': 'undefined'
  }
});
