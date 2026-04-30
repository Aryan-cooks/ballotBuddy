# ── Stage: Build & Serve ────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

# Install all dependencies (devDeps required for Vite build)
RUN npm ci

# Copy the rest of the project (includes .env.production for Vite bake-in)
COPY . .

# Build the Vite SPA → outputs to /app/dist
RUN npm run build

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the Express production server
CMD ["npm", "start"]
