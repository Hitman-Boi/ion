#!/bin/bash
set -e

# This script runs when the PostgreSQL container is first initialized
# It creates:
# 1. A 'learninghub' user for the Next.js application
# 2. The 'posthog' database for PostHog analytics

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create application user for Next.js
    CREATE USER learninghub WITH PASSWORD 'learninghub';
    GRANT ALL PRIVILEGES ON DATABASE learning_hub TO learninghub;
    
    -- Grant schema privileges (required for Prisma)
    \c learning_hub
    GRANT ALL ON SCHEMA public TO learninghub;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO learninghub;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO learninghub;
    
    -- Create PostHog database
    \c postgres
    CREATE DATABASE posthog;
    GRANT ALL PRIVILEGES ON DATABASE posthog TO $POSTGRES_USER;
EOSQL

echo "Created 'learninghub' user and 'posthog' database"
