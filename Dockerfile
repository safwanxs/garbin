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

# --- Build-time Firebase client config ---
# These are injected by Render (or --build-arg locally) and must be
# present as real env vars BEFORE `npm run build` runs, since Vite
# bakes VITE_* values into the bundle at build time, not runtime.
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Build Vite static bundle
RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "backend/index.js"]
