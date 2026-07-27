# Production Dockerfile for Garbin (Cloud Run Ready)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and backend package files
COPY package*.json ./
RUN npm ci

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Copy full application source
COPY . .

# Build Vite static bundle
RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "backend/index.js"]
