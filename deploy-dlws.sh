#!/bin/bash
set -e

echo "=========================================="
echo "🚀 DEPLOYING FULL SYSTEM TO DLWS"
echo "=========================================="

bash deploy-frontend-dlws.sh
echo ""
bash deploy-backend-dlws.sh

echo "=========================================="
echo "🎉 DLWS FULL DEPLOYMENT COMPLETE!"
echo "=========================================="
