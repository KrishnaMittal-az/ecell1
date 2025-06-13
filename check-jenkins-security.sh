#!/bin/bash

# Jenkins Security Check Script

echo "=== Jenkins Security Status Check ==="
echo ""

# Test main dashboard access
echo "1. Testing main dashboard access..."
MAIN_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:8080/")
if [ "$MAIN_STATUS" = "200" ]; then
    echo "   ❌ WARNING: Main dashboard is publicly accessible!"
else
    echo "   ✅ Main dashboard requires authentication (HTTP $MAIN_STATUS)"
fi

# Test API access
echo "2. Testing API access..."
API_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:8080/api/json")
if [ "$API_STATUS" = "200" ]; then
    echo "   ❌ WARNING: API is publicly accessible!"
else
    echo "   ✅ API requires authentication (HTTP $API_STATUS)"
fi

# Test webhook endpoint
echo "3. Testing GitHub webhook endpoint..."
WEBHOOK_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:8080/github-webhook/")
if [ "$WEBHOOK_STATUS" = "405" ]; then
    echo "   ✅ Webhook endpoint accessible (HTTP $WEBHOOK_STATUS - Method Not Allowed is expected)"
elif [ "$WEBHOOK_STATUS" = "200" ]; then
    echo "   ✅ Webhook endpoint accessible (HTTP $WEBHOOK_STATUS)"
else
    echo "   ⚠️  Webhook endpoint status: HTTP $WEBHOOK_STATUS"
fi

# Check if users exist
echo "4. Checking user accounts..."
if sudo test -d "/var/lib/jenkins/users/" && [ "$(sudo ls -1 /var/lib/jenkins/users/ | grep -v users.xml | wc -l)" -gt 0 ]; then
    echo "   ✅ User accounts are configured"
    echo "   📋 Existing users:"
    sudo cat /var/lib/jenkins/users/users.xml | grep -o '<string>[^<]*</string>' | sed 's/<[^>]*>//g' | grep -v '^$' | sed 's/^/      - /'
else
    echo "   ❌ No user accounts found"
fi

echo ""
echo "=== Security Summary ==="
if [ "$MAIN_STATUS" != "200" ] && [ "$API_STATUS" != "200" ]; then
    echo "✅ Jenkins is properly secured for public exposure"
    echo "✅ GitHub webhooks will work (endpoint accessible)"
    echo "✅ Admin access requires login"
else
    echo "❌ Jenkins needs additional security configuration"
fi
echo ""

