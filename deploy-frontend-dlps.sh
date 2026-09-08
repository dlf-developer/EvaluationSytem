#!/bin/bash
set -e

SERVER_IP="148.135.136.129"
SERVER_USER="root"
SERVER_PATH="/www/wwwroot/frontend"

SSH_KEY=""
if [ -f "$HOME/.ssh/id_rsa" ]; then
  SSH_KEY="-i $HOME/.ssh/id_rsa"
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_KEY="-i $HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/aaPanel.pem" ]; then
  SSH_KEY="-i $HOME/.ssh/aaPanel.pem"
fi

echo "🚀 Building frontend for DLPS environment..."
CI=false npm run build:dlps --prefix frontend

echo "📦 Zipping frontend build files..."
cd frontend/build
zip -r ../dlps-build.zip . > /dev/null
cd ../..

echo "📤 Uploading frontend zip to server ($SERVER_USER@$SERVER_IP)..."
scp -o StrictHostKeyChecking=no $SSH_KEY frontend/dlps-build.zip $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "📂 Updating build directory on server and restarting frontend service..."
ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "
  cd $SERVER_PATH
  rm -rf build_new && mkdir -p build_new
  unzip -o dlps-build.zip -d build_new > /dev/null
  rm -rf build && mv build_new build
  rm -f dlps-build.zip
  cp -r build/* .

  # Restart Node Frontend Service on port 3010
  if [ -f /www/server/nodejs/vhost/pids/Frontend.pid ]; then
    kill -9 \$(cat /www/server/nodejs/vhost/pids/Frontend.pid) 2>/dev/null || true
  fi
  fuser -k 3010/tcp 2>/dev/null || true
  sleep 1
  bash /www/server/nodejs/vhost/scripts/Frontend.sh
"

echo "✅ DLPS Frontend Deployment Complete & Service Restarted!"
