#!/bin/bash
set -e

REPO_DIR="/root/.openclaw/workspace-leads/agent-office"

echo "=== [$(date -u)] CI Deploy triggered ==="

cd "$REPO_DIR"

echo "--- Pulling latest main ---"
git pull origin main

echo "--- Installing backend deps ---"
cd backend && npm install --production
cd ..

echo "--- Installing frontend deps ---"
cd frontend && npm install
echo "--- Building frontend ---"
npm run build
cd ..

echo "--- Restarting backend ---"
pkill -f "node src/server.js" 2>/dev/null || true
sleep 1
nohup node backend/src/server.js >> /tmp/agent-office-backend.log 2>&1 &
disown $!
echo "Backend PID: $!"

echo "--- Restarting frontend ---"
fuser -k 8080/tcp 2>/dev/null || true
sleep 1
nohup node frontend/node_modules/.bin/next dev -p 8080 >> /tmp/agent-office-frontend.log 2>&1 &
disown $!
echo "Frontend PID: $!"

sleep 4
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "000")

echo "=== Health check ==="
echo "Backend:  HTTP $BACKEND_STATUS"
echo "Frontend: HTTP $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
  echo "=== Deploy SUCCESS ==="
  exit 0
else
  echo "=== Deploy FAILED — check logs ==="
  exit 1
fi
