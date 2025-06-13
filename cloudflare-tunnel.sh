#!/bin/bash

# Cloudflare Tunnel Script for Jenkins
# Note: URL changes each restart (free tier limitation)

echo "Starting Cloudflare tunnel for Jenkins..."
echo "Jenkins is running on localhost:8080"
echo ""
echo "The tunnel URL will be shown below:"
echo "Use that URL + /github-webhook/ for your GitHub webhook"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

# Kill any existing cloudflared processes
pkill cloudflared 2>/dev/null || true
sleep 2

# Start the tunnel
cloudflared tunnel --url http://localhost:8080

