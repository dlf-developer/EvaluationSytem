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
ssh -o StrictHostKeyChecking=no $SSH_KEY $SERVER_USER@$SERVER_IP "source ~/.bashrc 2>/dev/null || true; source /etc/profile 2>/dev/null || true; AAPANEL_NODE=\$(ls -d /www/server/nodejs/v*/bin 2>/dev/null | tail -n 1); export PATH=\$AAPANEL_NODE:\$PATH:/usr/local/bin:/usr/bin:\$(npm config get prefix 2>/dev/null)/bin:~/.nvm/versions/node/\$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin; cd $SERVER_PATH && unzip -o backend-dlps.zip && rm backend-dlps.zip && npm install --omit=dev && (fuser -k 8000/tcp 2>/dev/null || lsof -ti:8000 | xargs kill -9 2>/dev/null || true) && (PM2_CMD=\$(command -v pm2 || which pm2 2>/dev/null || echo \"\"); if [ -z \"\$PM2_CMD\" ]; then npm install -g pm2 2>/dev/null || true; PM2_CMD=\$(command -v pm2 || echo \"\"); fi; if [ -n \"\$PM2_CMD\" ]; then \$PM2_CMD restart backend-dlps 2>/dev/null || \$PM2_CMD start server.js --name \"backend-dlps\"; \$PM2_CMD save 2>/dev/null || true; else pkill -f 'node.*server.js' || true; nohup node server.js > app.log 2>&1 & fi)"

echo "✅ DLPS Backend Deployment Complete!"
