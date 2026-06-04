#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SERVICE_NAME=${OPS_CONSOLE_SERVICE:-plozen-ops-console}
PORT=${OPS_CONSOLE_PORT:-3100}
COLLECTOR=${OPS_CONSOLE_COLLECTOR:-local}
SERVER_LABEL=${OPS_CONSOLE_SERVER_LABEL:-13번 서버}
DATA_PATHS=${OPS_CONSOLE_DATA_PATHS:-/mnt/data,/data,/srv,/home}
NPM_BIN=$(command -v npm)
SERVICE_DIR="${HOME}/.config/systemd/user"
SERVICE_FILE="${SERVICE_DIR}/${SERVICE_NAME}.service"

cd "$PROJECT_ROOT"
npm ci
npm run build

docker rm -f "$SERVICE_NAME" >/dev/null 2>&1 || true

mkdir -p "$SERVICE_DIR"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=PLOZEN Ops Console Next server
After=network-online.target

[Service]
Type=simple
WorkingDirectory=$PROJECT_ROOT
Environment="NODE_ENV=production"
Environment="HOSTNAME=0.0.0.0"
Environment="PORT=$PORT"
Environment="OPS_CONSOLE_COLLECTOR=$COLLECTOR"
Environment="OPS_CONSOLE_SERVER_LABEL=$SERVER_LABEL"
Environment="OPS_CONSOLE_DATA_PATHS=$DATA_PATHS"
ExecStart=$NPM_BIN run start
Restart=unless-stopped
RestartSec=3

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable "$SERVICE_NAME.service" >/dev/null
systemctl --user restart "$SERVICE_NAME.service"
systemctl --user --no-pager --full status "$SERVICE_NAME.service"
