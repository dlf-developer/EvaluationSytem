#!/bin/bash
set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "=========================================="
  echo "📦 ZIP PACKAGE SELECTOR"
  echo "=========================================="
  echo "1) DLWS (dlws-build.zip & backend-dlws.zip)"
  echo "2) DLPS (dlps-build.zip & backend-dlps.zip)"
  echo "3) Both DLWS and DLPS"
  echo "=========================================="
  read -p "Select environment [1-3] (or dlws/dlps): " choice
  case "$choice" in
    1|dlws|DLWS) ENV="dlws" ;;
    2|dlps|DLPS) ENV="dlps" ;;
    3|all|ALL) ENV="all" ;;
    *) echo "❌ Invalid selection"; exit 1 ;;
  esac
fi

zip_dlws() {
  echo ""
  echo "📦 Creating DLWS Zip packages..."
  npm run zip:dlws --prefix frontend
  bash zip-backend-dlws.sh
}

zip_dlps() {
  echo ""
  echo "📦 Creating DLPS Zip packages..."
  npm run zip:dlps --prefix frontend
  bash zip-backend-dlps.sh
}

case "$ENV" in
  dlws|DLWS)
    zip_dlws
    ;;
  dlps|DLPS)
    zip_dlps
    ;;
  all|ALL)
    zip_dlws
    zip_dlps
    ;;
  *)
    echo "❌ Unknown environment '$ENV'. Usage: npm run zip -- [dlws|dlps|all]"
    exit 1
    ;;
esac

echo ""
echo "✨ ZIP PACKAGES CREATED SUCCESSFULLY!"
