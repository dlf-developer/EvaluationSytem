#!/bin/bash
set -e

SERVER_IP="148.135.136.129"
SERVER_USER="root"
SERVER_PATH="/www/wwwroot/evaluation.dlws.edu.in"

SSH_KEY=""
if [ -f "$HOME/.ssh/id_rsa" ]; then
  SSH_KEY="-i $HOME/.ssh/id_rsa"
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_KEY="-i $HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/aaPanel.pem" ]; then
  SSH_KEY="-i $HOME/.ssh/aaPanel.pem"
fi

echo "🚀 Building frontend for DLWS environment..."
CI=false npm run build:dlws --prefix frontend

echo "📦 Zipping frontend build files..."
cd frontend/build
zip -r ../dlws-build.zip . > /dev/null
cd ../..

echo "📤 Uploading frontend zip to server ($SERVER_USER@$SERVER_IP)..."
scp -o StrictHostKeyChecking=no $SSH_KEY frontend/dlws-build.zip $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "📂 Updating build directory on server and restarting frontend service..."
ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "
  cd $SERVER_PATH
  rm -rf build_new && mkdir -p build_new
  unzip -o dlws-build.zip -d build_new > /dev/null
  rm -rf build && mv build_new build
  rm -f dlws-build.zip
  cp -r build/* .

  # Restart Node evaluation2 Service on port 3011
  if [ -f /www/server/nodejs/vhost/pids/evaluation2.pid ]; then
    kill -9 \$(cat /www/server/nodejs/vhost/pids/evaluation2.pid) 2>/dev/null || true
  fi
  fuser -k 3011/tcp 2>/dev/null || true
  sleep 1
  bash /www/server/nodejs/vhost/scripts/evaluation2.sh
"

echo "✅ DLWS Frontend Deployment Complete & Service Restarted!"
