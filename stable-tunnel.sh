#!/bin/bash

# Stable Jenkins Tunnel Script
# Uses localhost.run with consistent subdomain
# URL: https://jenkins-krishna.localhost.run

TUNNEL_NAME="jenkins-krishna"
LOCAL_PORT="8080"
WEBHOOK_URL="https://${TUNNEL_NAME}.localhost.run/github-webhook/"

echo "=== Jenkins Stable Tunnel ==="
echo "Local Jenkins: http://localhost:${LOCAL_PORT}"
echo "Public URL: https://${TUNNEL_NAME}.localhost.run"
echo "GitHub Webhook URL: ${WEBHOOK_URL}"
echo ""
echo "⚠️  SECURITY NOTE: Your Jenkins will be publicly accessible!"
echo "💡 Make sure Jenkins has proper authentication enabled."
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo "==========================================="
echo ""

# Start the stable tunnel
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 \
    -R ${TUNNEL_NAME}:80:localhost:${LOCAL_PORT} \
    nokey@localhost.run

