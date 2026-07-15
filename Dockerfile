# Stage 1: Build the Vite React frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package details and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build the static assets
COPY . .
RUN npm run build

# Stage 2: Set up backend runtime
FROM node:20-alpine
WORKDIR /app

# Copy backend package details and install production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy backend code
COPY server/index.js ./server/

# Copy built frontend assets from Stage 1
COPY --from=builder /app/dist ./dist

# Expose port and configure environment
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server/index.js"]
