#!/bin/bash

# Jenkins Tunnel Script for GitHub Webhooks
# Creates a stable URL: https://jenkins-webhook.localhost.run

echo "Starting Jenkins tunnel for GitHub webhooks..."
echo "Tunnel URL will be: https://jenkins-webhook.localhost.run"
echo "GitHub webhook URL should be: https://jenkins-webhook.localhost.run/github-webhook/"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

# Create the tunnel
ssh -o StrictHostKeyChecking=no -R jenkins-webhook:80:localhost:8080 nokey@localhost.run

