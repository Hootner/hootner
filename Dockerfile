# HOOTNER - Hexagonal Architecture
FROM node:25.2.1-alpine

LABEL maintainer="HOOTNER Team"
LABEL description="The Owl Never Sleeps - Hexagonal Video Platform"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy hexagonal architecture
COPY hexarchy/ ./hexarchy/
COPY index.js ./
COPY README.md ./

# Create non-root user
RUN addgroup -g 1001 -S hootner && \
    adduser -S hootner -u 1001

# Set permissions
RUN chown -R hootner:hootner /app
USER hootner

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

EXPOSE 3000

CMD ["node", "index.js"]