#!/usr/bin/env sh
set -eu

FRONTEND_URL=""
API_BASE_URL=""
PROVIDER_NAME="public deployment"
PLAYWRIGHT_IMAGE="${FINMIND_PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.55.0-noble}"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --frontend-url)
      FRONTEND_URL="$2"
      shift 2
      ;;
    --api-base-url)
      API_BASE_URL="$2"
      shift 2
      ;;
    --provider-name)
      PROVIDER_NAME="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [ -z "$FRONTEND_URL" ] || [ -z "$API_BASE_URL" ]; then
  echo "Usage: ./scripts/validate-public-deployment.sh --frontend-url <url> --api-base-url <url> [--provider-name <label>]" >&2
  exit 1
fi

python3 scripts/smoke-deploy.py \
  --api-base-url "$API_BASE_URL" \
  --frontend-url "$FRONTEND_URL"

docker run --rm \
  --ipc=host \
  -e FINMIND_UI_BASE_URL="$FRONTEND_URL" \
  -e FINMIND_UI_HEALTH_URL="${API_BASE_URL%/}/health/ready" \
  -e FINMIND_UI_PROVIDER_NAME="$PROVIDER_NAME" \
  -v "$PWD":/work \
  -w /work \
  "$PLAYWRIGHT_IMAGE" \
  sh -lc '
    mkdir -p /tmp/finmind-playwright &&
    cd /tmp/finmind-playwright &&
    npm init -y >/dev/null 2>&1 &&
    npm install --silent playwright@1.55.0 >/dev/null 2>&1 &&
    cp /work/scripts/validate-ui.mjs ./validate-ui.mjs &&
    node ./validate-ui.mjs \
      --base-url "$FINMIND_UI_BASE_URL" \
      --health-url "$FINMIND_UI_HEALTH_URL" \
      --provider-name "$FINMIND_UI_PROVIDER_NAME"
  '
