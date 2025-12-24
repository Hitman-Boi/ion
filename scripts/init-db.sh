#!/bin/bash
set -e

# This script runs when the PostgreSQL container is first initialized
# It creates the additional 'posthog' database alongside the default 'learning_hub' database

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE posthog;
    GRANT ALL PRIVILEGES ON DATABASE posthog TO $POSTGRES_USER;
EOSQL

echo "✅ Created 'posthog' database"
