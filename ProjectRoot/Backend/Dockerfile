# Use Node.js LTS alpine for a lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Add support for host.docker.internal on Linux
RUN apk add --no-cache bash

# Install dependencies using caching
COPY package*.json ./

# Enable npm cache mounting
RUN mkdir -p /root/.npm

# Install dependencies with npm cache
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src

# Build with TypeScript
RUN npx tsc

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
