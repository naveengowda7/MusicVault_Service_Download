FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
  python3 \
  py3-pip \
  ffmpeg \
  wget

# Install yt-dlp
RUN pip3 install yt-dlp

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

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]