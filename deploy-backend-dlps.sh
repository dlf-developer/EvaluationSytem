#!/bin/bash
set -e

SERVER_IP="148.135.136.129"
SERVER_USER="root"
SERVER_PATH="/www/wwwroot/backend"

SSH_KEY=""
if [ -f "$HOME/.ssh/id_rsa" ]; then
  SSH_KEY="-i $HOME/.ssh/id_rsa"
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_KEY="-i $HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/aaPanel.pem" ]; then
  SSH_KEY="-i $HOME/.ssh/aaPanel.pem"
fi

echo "🚀 Preparing Backend deployment for DLPS environment..."

STAGING_DIR="Backend/.staging_dlps"
rm -rf $STAGING_DIR backend-dlps.zip
mkdir -p $STAGING_DIR

cp -r Backend/app.js Backend/server.js Backend/package.json Backend/package-lock.json $STAGING_DIR/ 2>/dev/null || true
cp -r Backend/config Backend/controllers Backend/middleware Backend/models Backend/routes Backend/utils $STAGING_DIR/ 2>/dev/null || true
cp Backend/.env.dlps $STAGING_DIR/.env

echo "📦 Zipping backend files..."
cd $STAGING_DIR
zip -r ../../backend-dlps.zip . > /dev/null
cd ../..
rm -rf $STAGING_DIR

echo "📤 Uploading backend-dlps.zip to server ($SERVER_USER@$SERVER_IP)..."
scp -o StrictHostKeyChecking=no $SSH_KEY backend-dlps.zip $SERVER_USER@$SERVER_IP:$SERVER_PATH/

ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "
  cd $SERVER_PATH
  unzip -o backend-dlps.zip
  rm -f backend-dlps.zip
  npm install --omit=dev
  if [ -f /www/server/nodejs/vhost/pids/backend.pid ]; then
    kill -9 \$(cat /www/server/nodejs/vhost/pids/backend.pid) 2>/dev/null || true
  fi
  fuser -k 8000/tcp 2>/dev/null || true
  sleep 1
  bash /www/server/nodejs/vhost/scripts/backend.sh
"


echo "✅ DLPS Backend Deployment Complete!"
