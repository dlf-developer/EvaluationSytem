#!/bin/bash
set -e

SERVER_IP="148.135.136.129"
SERVER_USER="root"
SERVER_PATH="/www/wwwroot/api.dlws"

SSH_KEY=""
if [ -f "$HOME/.ssh/id_rsa" ]; then
  SSH_KEY="-i $HOME/.ssh/id_rsa"
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_KEY="-i $HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/aaPanel.pem" ]; then
  SSH_KEY="-i $HOME/.ssh/aaPanel.pem"
fi

echo "🚀 Preparing Backend deployment for DLWS environment..."

STAGING_DIR="Backend/.staging_dlws"
rm -rf $STAGING_DIR backend-dlws.zip
mkdir -p $STAGING_DIR

cp -r Backend/app.js Backend/server.js Backend/package.json Backend/package-lock.json $STAGING_DIR/ 2>/dev/null || true
cp -r Backend/config Backend/controllers Backend/middleware Backend/models Backend/routes Backend/utils $STAGING_DIR/ 2>/dev/null || true
cp Backend/.env.dlws $STAGING_DIR/.env

echo "📦 Zipping backend files..."
cd $STAGING_DIR
zip -r ../../backend-dlws.zip . > /dev/null
cd ../..
rm -rf $STAGING_DIR

echo "📤 Uploading backend-dlws.zip to server ($SERVER_USER@$SERVER_IP)..."
scp -o StrictHostKeyChecking=no $SSH_KEY backend-dlws.zip $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "📂 Unzipping on server & restarting backend process..."
ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && unzip -o backend-dlws.zip && rm backend-dlws.zip && npm install --omit=dev && (/www/server/panel/pyenv/bin/python -c \"import sys; sys.path.append('/www/server/panel/class'); import projectModel.nodeModel as nodeModel; nodeModel.main().restart_project({'name': 'DLWSBackend'})\" 2>/dev/null || /www/server/panel/pyenv/bin/python -c \"import sys; sys.path.append('/www/server/panel/class'); import projectModel.nodeModel as nodeModel; nodeModel.main().start_project({'name': 'DLWSBackend'})\" 2>/dev/null || (fuser -k 5010/tcp 2>/dev/null || true; nohup /www/server/nodejs/v22.13.0/bin/node server.js > app.log 2>&1 &))"

echo "✅ DLWS Backend Deployment Complete!"
