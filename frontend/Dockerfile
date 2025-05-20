# frontend/Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Create a custom vite.config.js that bypasses the crypto issue
RUN echo 'import { defineConfig } from "vite"; \
import react from "@vitejs/plugin-react"; \
export default defineConfig({ \
  plugins: [react()], \
  build: { \
    rollupOptions: { \
      external: ["crypto"], \
    }, \
  }, \
  define: { \
    "globalThis.crypto": "{}" \
  } \
});' > vite.config.js

# Build the application
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx configuration for SPA routing
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]