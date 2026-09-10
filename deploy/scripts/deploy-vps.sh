#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/field-crm}"
DOMAIN="${DOMAIN:-field.schoolhub.co.ke}"
API_SERVICE="${API_SERVICE:-field-crm-api}"
NGINX_SITE="${NGINX_SITE:-field-crm.conf}"

log() {
  printf '\n[%s] %s\n' "$(date +'%Y-%m-%d %H:%M:%S')" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_file() {
  if [ ! -f "$1" ]; then
    echo "Missing required file: $1" >&2
    exit 1
  fi
}

require_command git
require_command npm
require_command node
require_command npx
require_command nginx
require_command systemctl

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Expected a git checkout at $APP_DIR." >&2
  echo "Clone the repo first, then rerun this script." >&2
  exit 1
fi

cd "$APP_DIR"

log "Updating source"
git fetch origin main
git pull --ff-only origin main

if [ ! -f "$APP_DIR/api/.env" ]; then
  cp "$APP_DIR/api/.env.production.example" "$APP_DIR/api/.env"
  echo "Created $APP_DIR/api/.env from the example." >&2
  echo "Create the isolated field_crm database with deploy/scripts/setup-postgres.sh." >&2
  echo "Then edit DATABASE_URL and JWT_SECRET, and rerun this script." >&2
  exit 1
fi

if grep -Eq 'DATABASE_URL=.*(schoolhub|school_hub)' "$APP_DIR/api/.env"; then
  echo "Refusing to deploy: DATABASE_URL appears to reference the existing SchoolHub database." >&2
  echo "Use a separate field_crm database and field_crm_app user." >&2
  exit 1
fi

if ! grep -Eq '^DATABASE_URL=.*://field_crm_app:' "$APP_DIR/api/.env"; then
  echo "Refusing to deploy: DATABASE_URL must use the separate field_crm_app database user." >&2
  exit 1
fi

if ! grep -Eq '^DATABASE_URL=.*/field_crm(\?|")' "$APP_DIR/api/.env"; then
  echo "Refusing to deploy: DATABASE_URL must reference the separate field_crm database." >&2
  exit 1
fi

if [ ! -f "$APP_DIR/client/.env.production" ]; then
  cp "$APP_DIR/client/.env.production.example" "$APP_DIR/client/.env.production"
fi

log "Installing API dependencies"
cd "$APP_DIR/api"
npm ci

log "Preparing database"
npx prisma generate
npx prisma db push

log "Building API"
NODE_OPTIONS=--max-old-space-size=4096 npm run build

log "Installing client dependencies"
cd "$APP_DIR/client"
npm ci

log "Building client"
npm run build

log "Installing systemd service"
require_file "$APP_DIR/deploy/systemd/field-crm-api.service"
sudo cp "$APP_DIR/deploy/systemd/field-crm-api.service" "/etc/systemd/system/${API_SERVICE}.service"
sudo systemctl daemon-reload
sudo systemctl enable "$API_SERVICE"
sudo systemctl restart "$API_SERVICE"

log "Installing Nginx site"
require_file "$APP_DIR/deploy/nginx/field-crm.conf"
sudo cp "$APP_DIR/deploy/nginx/field-crm.conf" "/etc/nginx/sites-available/${NGINX_SITE}"
sudo ln -sfn "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
sudo nginx -t
sudo systemctl reload nginx

if command -v certbot >/dev/null 2>&1 && [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  log "Reinstalling existing HTTPS certificate"
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --redirect --keep-until-expiring
  sudo nginx -t
  sudo systemctl reload nginx
fi

log "Deployment complete"
echo "Open: https://${DOMAIN}"
echo "API health check: https://${DOMAIN}/api/"
