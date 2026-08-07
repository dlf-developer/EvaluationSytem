#!/bin/bash
set -e

STAGING_DIR="Backend/.staging_dlps"
rm -rf $STAGING_DIR backend-dlps.zip
mkdir -p $STAGING_DIR

cp -r Backend/app.js Backend/server.js Backend/package.json Backend/package-lock.json $STAGING_DIR/ 2>/dev/null || true
cp -r Backend/config Backend/controllers Backend/middleware Backend/models Backend/routes Backend/utils $STAGING_DIR/ 2>/dev/null || true
cp Backend/.env.dlps $STAGING_DIR/.env

cd $STAGING_DIR
zip -r ../../backend-dlps.zip . > /dev/null
cd ../..
rm -rf $STAGING_DIR

echo "📦 Created backend-dlps.zip (includes DLPS .env file ready for aaPanel)"
