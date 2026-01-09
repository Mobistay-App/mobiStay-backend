# Docker Configuration
FROM node:24-alpine

WORKDIR /app

# Install dependencies needed for certain native modules
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client with a dummy URL to bypass configuration check during build
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

# Final build (if using production build step)
# RUN npm run build

# Expose port
EXPOSE 5000

# Start command
CMD ["npx", "tsx", "src/server.ts"]
