# Use Node.js LTS alpine for a lightweight image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
