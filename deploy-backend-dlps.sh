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

ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && unzip -o backend-dlps.zip && rm backend-dlps.zip && npm install --omit=dev && (pkill -f 'NODE_PROJECT_NAME=backend' || pkill -f 'node.*backend' || true) && su - www -s /bin/bash -c 'cd $SERVER_PATH && PATH=$SERVER_PATH/node_modules/.bin:/www/server/nodejs/v22.13.0/bin:\$PATH NODE_PROJECT_NAME=backend nohup node server.js > /dev/null 2>&1 &'"


echo "✅ DLPS Backend Deployment Complete!"
