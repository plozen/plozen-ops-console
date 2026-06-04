#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
CONTAINER_NAME=${OPS_CONSOLE_CONTAINER:-plozen-ops-console}
IMAGE_NAME=${OPS_CONSOLE_IMAGE:-plozen-ops-console:latest}
PORT=${OPS_CONSOLE_PORT:-3100}
COLLECTOR=${OPS_CONSOLE_COLLECTOR:-local}
SERVER_LABEL=${OPS_CONSOLE_SERVER_LABEL:-}
SSH_HOST=${OPS_CONSOLE_SSH_HOST:-}
DATA_PATHS=${OPS_CONSOLE_DATA_PATHS:-}

docker build -t "$IMAGE_NAME" "$PROJECT_ROOT"

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -e OPS_CONSOLE_COLLECTOR="$COLLECTOR" \
  -e OPS_CONSOLE_SERVER_LABEL="$SERVER_LABEL" \
  -e OPS_CONSOLE_SSH_HOST="$SSH_HOST" \
  -e OPS_CONSOLE_DATA_PATHS="$DATA_PATHS" \
  -p "$PORT:3000" \
  "$IMAGE_NAME"
