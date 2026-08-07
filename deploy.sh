#!/bin/bash
set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "=========================================="
  echo "🚀 SYSTEM DEPLOYMENT SELECTOR"
  echo "=========================================="
  echo "1) DLWS (Frontend: evaluation.dlws.edu.in | Backend: api.dlws)"
  echo "2) DLPS (Frontend: frontend | Backend: backend)"
  echo "3) Both DLWS and DLPS"
  echo "=========================================="
  read -p "Select environment to deploy [1-3] (or dlws/dlps): " choice
  case "$choice" in
    1|dlws|DLWS) ENV="dlws" ;;
    2|dlps|DLPS) ENV="dlps" ;;
    3|all|ALL|both|Both) ENV="all" ;;
    *) echo "❌ Invalid selection"; exit 1 ;;
  esac
fi

deploy_dlws() {
  echo ""
  echo "=========================================="
  echo "🚀 DEPLOYING DLWS (Frontend + Backend)"
  echo "=========================================="
  bash deploy-frontend-dlws.sh
  echo ""
  bash deploy-backend-dlws.sh
}

deploy_dlps() {
  echo ""
  echo "=========================================="
  echo "🚀 DEPLOYING DLPS (Frontend + Backend)"
  echo "=========================================="
  bash deploy-frontend-dlps.sh
  echo ""
  bash deploy-backend-dlps.sh
}

case "$ENV" in
  dlws|DLWS)
    deploy_dlws
    ;;
  dlps|DLPS)
    deploy_dlps
    ;;
  all|ALL)
    deploy_dlws
    deploy_dlps
    ;;
  *)
    echo "❌ Unknown environment '$ENV'. Usage: npm run deploy -- [dlws|dlps|all]"
    exit 1
    ;;
esac

echo ""
echo "🎉 DEPLOYMENT FINISHED SUCCESSFULLY!"
