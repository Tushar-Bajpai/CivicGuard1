# Dockerfile

# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the Vite project (outputs to /dist)
RUN npm run build

# ==========================================
# Stage 2: Serve with Node.js
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copy production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the .env file so the backend can read GEMINI_API_KEY
COPY --from=builder /app/.env ./.env

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the Express server
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
