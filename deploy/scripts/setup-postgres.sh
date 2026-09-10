#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-field_crm}"
DB_USER="${DB_USER:-field_crm_app}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [ -z "$DB_PASSWORD" ]; then
  echo "DB_PASSWORD is required." >&2
  echo "Example: DB_PASSWORD='long-random-password' bash deploy/scripts/setup-postgres.sh" >&2
  exit 1
fi

if [ "$DB_NAME" != "field_crm" ]; then
  echo "Refusing to create unexpected database '$DB_NAME'. This deploy must use a separate field_crm database." >&2
  exit 1
fi

if [ "$DB_USER" != "field_crm_app" ]; then
  echo "Refusing to create unexpected user '$DB_USER'. This deploy must use a separate field_crm_app user." >&2
  exit 1
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 \
  -v db_name="$DB_NAME" \
  -v db_user="$DB_USER" \
  -v db_password="$DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I WITH LOGIN PASSWORD %L', :'db_user', :'db_password')
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'db_user')\gexec

SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'db_user', :'db_password')\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name')\gexec

SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'db_name', :'db_user')\gexec
SQL

echo "Created/verified isolated PostgreSQL database '$DB_NAME' and user '$DB_USER'."
echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public\""
