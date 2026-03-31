#!/bin/bash
set -e

REPO_DIR="/root/.openclaw/workspace-leads/agent-office"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"

echo "=== [$(date -u)] CI Deploy triggered ==="

cd "$REPO_DIR"

echo "--- Pulling latest main ---"
git pull origin main

echo "--- Installing backend deps ---"
cd "$BACKEND_DIR" && npm install --omit=dev

echo "--- Ensuring frontend env ---"
echo "NEXT_PUBLIC_API_URL=http://204.168.215.253:4000" > "$FRONTEND_DIR/.env.local"

echo "--- Installing frontend deps ---"
cd "$FRONTEND_DIR" && npm install

echo "--- Building frontend ---"
cd "$FRONTEND_DIR" && npm run build

echo "--- Restarting backend ---"
pkill -f "backend/src/server.js" 2>/dev/null || true
sleep 1
cd "$BACKEND_DIR"
nohup node src/server.js >> /tmp/agent-office-backend.log 2>&1 &
disown $!
echo "Backend PID: $!"

echo "--- Restarting frontend ---"
fuser -k 8080/tcp 2>/dev/null || true
sleep 1
cd "$FRONTEND_DIR"
nohup node_modules/.bin/next start -p 8080 >> /tmp/agent-office-frontend.log 2>&1 &
disown $!
echo "Frontend PID: $!"

echo "--- Waiting for services ---"
sleep 8

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health 2>/dev/null || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "000")

echo "=== Health check ==="
echo "Backend:  HTTP $BACKEND_STATUS"
echo "Frontend: HTTP $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
  echo "=== Deploy SUCCESS ==="
  exit 0
else
  echo "=== Deploy FAILED — check /tmp/agent-office-*.log ==="
  exit 1
fi
