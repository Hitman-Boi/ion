#!/bin/bash

# Source env vars
if [ -f "versions.env" ]; then
    echo "Loading version configuration..."
    source versions.env
    export APP_VERSION
    export POSTGRES_VERSION
    export REDIS_VERSION
    export POSTHOG_VERSION
else
    echo "Error: versions.env not found!"
    exit 1
fi

echo "Loading Docker images..."

if [ -f "learning-hub-$APP_VERSION.tar" ]; then
    echo "Loading learning-hub-$APP_VERSION.tar..."
    docker load -i learning-hub-$APP_VERSION.tar
fi

if [ -f "postgres-$POSTGRES_VERSION.tar" ]; then
    echo "Loading postgres-$POSTGRES_VERSION.tar..."
    docker load -i postgres-$POSTGRES_VERSION.tar
fi

if [ -f "redis-$REDIS_VERSION.tar" ]; then
    echo "Loading redis-$REDIS_VERSION.tar..."
    docker load -i redis-$REDIS_VERSION.tar
fi

if [ -f "posthog-$POSTHOG_VERSION.tar" ]; then
    echo "Loading posthog-$POSTHOG_VERSION.tar..."
    docker load -i posthog-$POSTHOG_VERSION.tar
fi

echo "Starting application version $APP_VERSION..."
docker-compose -f docker-compose.production.yml up -d

# Wait for database to be ready
echo "Waiting for database to be healthy..."
until docker-compose -f docker-compose.production.yml exec -T db pg_isready -U ${DB_USERNAME:-postgres} -d ${DB_NAME:-learning_hub}; do
    echo "Database is not ready yet. Waiting..."
    sleep 2
done
echo "Database is ready."

# Run Prisma migrations
echo "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T app npx prisma migrate deploy

echo "Application started successfully with migrations applied."
