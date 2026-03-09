#!/bin/bash

# Initialize Let's Encrypt certificates
# Run this script on the production server

set -e

DOMAIN="formalproof.io"
EMAIL="admin@formalproof.io"

echo "🔐 Initializing Let's Encrypt certificates for $DOMAIN..."

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
docker-compose -f docker/docker-compose.yml stop nginx

# Get certificates
certbot certonly --standalone \
    --domains $DOMAIN \
    --domains www.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Copy certificates to nginx ssl directory
mkdir -p ssl/live/$DOMAIN
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/live/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/live/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/chain.pem ssl/live/$DOMAIN/

# Set permissions
chmod -R 755 ssl

# Restart nginx
docker-compose -f docker/docker-compose.yml start nginx

echo "✅ SSL certificates installed successfully!"
echo "🔄 Auto-renewal is configured via certbot timer"