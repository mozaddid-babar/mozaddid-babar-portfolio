# Multi-stage Dockerfile for Portfolio Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build Vite frontend and bundled Node server
RUN npm run build

# Production Runner stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3100

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server bundle
COPY --from=builder /app/dist ./dist

# Copy seed database
COPY data ./data

# Expose port
EXPOSE 3100

# Start server
CMD ["node", "dist/server.cjs"]
