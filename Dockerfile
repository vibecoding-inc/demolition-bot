FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and built files
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Expose port
EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
