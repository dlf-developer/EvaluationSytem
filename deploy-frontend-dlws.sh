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
npm run build:dlws --prefix frontend

echo "📦 Zipping frontend build files..."
cd frontend/build
zip -r ../dlws-build.zip . > /dev/null
cd ../..

echo "📤 Uploading frontend zip to server ($SERVER_USER@$SERVER_IP)..."
scp -o StrictHostKeyChecking=no $SSH_KEY frontend/dlws-build.zip $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "📂 Unzipping frontend on server..."
ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && unzip -o dlws-build.zip && rm dlws-build.zip && (if [ -d /www/wwwroot/dlws ]; then cp -r /www/wwwroot/evaluation.dlws.edu.in/* /www/wwwroot/dlws/; fi)"

echo "✅ DLWS Frontend Deployment Complete!"
