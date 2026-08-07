#!/bin/bash
set -e

STAGING_DIR="Backend/.staging_dlws"
rm -rf $STAGING_DIR backend-dlws.zip
mkdir -p $STAGING_DIR

cp -r Backend/app.js Backend/server.js Backend/package.json Backend/package-lock.json $STAGING_DIR/ 2>/dev/null || true
cp -r Backend/config Backend/controllers Backend/middleware Backend/models Backend/routes Backend/utils $STAGING_DIR/ 2>/dev/null || true
cp Backend/.env.dlws $STAGING_DIR/.env

cd $STAGING_DIR
zip -r ../../backend-dlws.zip . > /dev/null
cd ../..
rm -rf $STAGING_DIR

echo "📦 Created backend-dlws.zip (includes DLWS .env file ready for aaPanel)"
