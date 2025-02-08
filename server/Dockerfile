FROM node:18-slim

WORKDIR /app

# Install necessary build tools
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and tsconfig
COPY package*.json tsconfig.json ./

# First install all dependencies including devDependencies
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Clean up dev dependencies for production
RUN npm ci --only=production --ignore-scripts

# Expose port
EXPOSE 8080

# Start the server
CMD ["npm", "start"] 