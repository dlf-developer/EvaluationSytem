#!/bin/bash
set -e

echo "=========================================="
echo "🚀 DEPLOYING FULL SYSTEM TO DLPS"
echo "=========================================="

bash deploy-frontend-dlps.sh
echo ""
bash deploy-backend-dlps.sh

echo "=========================================="
echo "🎉 DLPS FULL DEPLOYMENT COMPLETE!"
echo "=========================================="
