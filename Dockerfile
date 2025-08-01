FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
  python3 \
  py3-pip \
  ffmpeg \
  wget

# Install yt-dlp using --break-system-packages flag (safe in Docker)
RUN pip3 install --break-system-packages yt-dlp

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create downloads and temp directories
RUN mkdir -p /tmp/downloads && mkdir -p temp

# Use PORT environment variable (Render will override this)
ENV PORT=5000
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]