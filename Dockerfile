FROM node:16-slim

WORKDIR /app

# Install Python & yt-dlp using pip
RUN apt-get update && apt-get install -y python3-pip && rm -rf /var/lib/apt/lists/*
RUN pip3 install -U yt-dlp

# Download Precompiled ffmpeg & Extract it to /usr/local/bin
RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar -xJf - --strip-components=1 -C /usr/local/bin

# Copy package files & install Node.js dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Create temp downloads directory
RUN mkdir -p /tmp/downloads

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
