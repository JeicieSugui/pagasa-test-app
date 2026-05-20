#!/bin/bash

set -euo pipefail

# --- CONFIGURATION ---
SERVER_USER="${SERVER_USER:-root}"
SERVER_IP="${SERVER_IP:-152.42.208.77}"
SERVER_DOMAIN="${SERVER_DOMAIN:-server4.gmstdevops.com}"
SERVER_HOST="${SERVER_HOST:-$SERVER_IP}"
PROJECT_NAME="${PROJECT_NAME:-pagasa-weather-app}"
FRONTEND_IMAGE_NAME="${FRONTEND_IMAGE_NAME:-pagasa-weather-demo-frontend:latest}"
BACKEND_IMAGE_NAME="${BACKEND_IMAGE_NAME:-pagasa-weather-demo-backend:latest}"

# Server paths
#REMOTE_PROJECT_DIR="/home/$SERVER_USER/training/$PROJECT_NAME"
REMOTE_PROJECT_DIR="${REMOTE_PROJECT_DIR:-~/training/$PROJECT_NAME}"
SSH_PORT="${SSH_PORT:-22}"
SSH_OPTS="-p ${SSH_PORT} -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new"
if [ -n "${SSH_KEY_PATH:-}" ]; then
  SSH_OPTS="${SSH_OPTS} -i ${SSH_KEY_PATH} -o IdentitiesOnly=yes"
fi
SSH_TARGET="${SERVER_USER}@${SERVER_HOST}"
# ---------------------

echo "🚀 Starting deployment for $PROJECT_NAME..."

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ docker is not installed or not available in PATH."
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "❌ rsync is not installed or not available in PATH."
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "❌ ssh is not installed or not available in PATH."
  exit 1
fi

if ! docker image inspect "$FRONTEND_IMAGE_NAME" >/dev/null 2>&1; then
  echo "❌ Frontend image not found: $FRONTEND_IMAGE_NAME"
  exit 1
fi

if ! docker image inspect "$BACKEND_IMAGE_NAME" >/dev/null 2>&1; then
  echo "❌ Backend image not found: $BACKEND_IMAGE_NAME"
  exit 1
fi

for required_file in \
  "docker-compose.prod.yml" \
  "./backend/data/samples/rainfall/sample_rainfall.png" \
  "./backend/data/samples/temperature/sample_temperature.png"; do
  if [ ! -f "$required_file" ]; then
    echo "❌ Required file not found: $required_file"
    exit 1
  fi
done

cleanup() {
  rm -f "${PROJECT_NAME}-frontend.tar" "${PROJECT_NAME}-backend.tar"
}

trap cleanup EXIT

echo "🔐 Checking SSH access to ${SSH_TARGET}:${SSH_PORT}..."
if ! ssh ${SSH_OPTS} "${SSH_TARGET}" "mkdir -p ${REMOTE_PROJECT_DIR}"; then
  echo "❌ SSH login failed for ${SSH_TARGET}:${SSH_PORT}."
  echo "   Make sure the correct user, key, and port are configured."
  echo "   You can override them with SERVER_USER, SSH_KEY_PATH, and SSH_PORT."
  exit 1
fi

# Save Docker image locally
echo "📦 Saving Docker image locally..."
docker save "$FRONTEND_IMAGE_NAME" -o "${PROJECT_NAME}-frontend.tar"
docker save "$BACKEND_IMAGE_NAME" -o "${PROJECT_NAME}-backend.tar"

# Transfer the docker images, docker-compose.prod.yml, backend data sample files using rsync with a live progress percentage
echo "🚚 Transferring docker images, docker-compose.prod.yml, backend data sample files to ${SERVER_HOST}..."
rsync -ah --progress --info=progress2 \
  -e "ssh ${SSH_OPTS}" \
  "${PROJECT_NAME}-frontend.tar" \
  "${PROJECT_NAME}-backend.tar" \
  docker-compose.prod.yml \
  ./backend/data/samples/rainfall/sample_rainfall.png \
  ./backend/data/samples/temperature/sample_temperature.png \
  "${SSH_TARGET}:${REMOTE_PROJECT_DIR}/"

# Load the image on the server, run the docker services, and clean up the tar file
echo "⚓ Loading image into server Docker engine..."
ssh ${SSH_OPTS} "${SSH_TARGET}" "docker load -i ${REMOTE_PROJECT_DIR}/${PROJECT_NAME}-frontend.tar && \
rm ${REMOTE_PROJECT_DIR}/${PROJECT_NAME}-frontend.tar && \
docker load -i ${REMOTE_PROJECT_DIR}/${PROJECT_NAME}-backend.tar && \
rm ${REMOTE_PROJECT_DIR}/${PROJECT_NAME}-backend.tar && \
mkdir -p ${REMOTE_PROJECT_DIR}/backend/data/samples/rainfall && \
mkdir -p ${REMOTE_PROJECT_DIR}/backend/data/samples/temperature && \
mv ${REMOTE_PROJECT_DIR}/sample_rainfall.png ${REMOTE_PROJECT_DIR}/backend/data/samples/rainfall/ && \
mv ${REMOTE_PROJECT_DIR}/sample_temperature.png ${REMOTE_PROJECT_DIR}/backend/data/samples/temperature/ && \
docker compose -f  ${REMOTE_PROJECT_DIR}/docker-compose.prod.yml up -d"

echo "✅ Image uploaded successfully and deployment completed!"
