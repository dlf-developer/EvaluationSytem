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

echo "📂 Unzipping on server & restarting backend process..."
ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "source ~/.bashrc 2>/dev/null || true; source /etc/profile 2>/dev/null || true; export PATH=\$PATH:/usr/local/bin:/usr/bin:\$(npm config get prefix 2>/dev/null)/bin:~/.nvm/versions/node/\$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:/www/server/nvm/versions/node/\$(ls /www/server/nvm/versions/node 2>/dev/null | tail -n 1)/bin; cd $SERVER_PATH && unzip -o backend-dlps.zip && rm backend-dlps.zip && npm install --omit=dev && (PM2_CMD=\$(command -v pm2 || which pm2 2>/dev/null || echo \"\"); if [ -n \"\$PM2_CMD\" ]; then \$PM2_CMD reload all || \$PM2_CMD restart all; elif command -v npx >/dev/null 2>&1; then npx pm2 reload all || npx pm2 restart all; else pkill -f 'node.*server.js' || true; fi)"

echo "✅ DLPS Backend Deployment Complete!"
