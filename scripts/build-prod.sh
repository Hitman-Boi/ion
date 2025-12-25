#!/bin/bash
set -e

# Extract versions from package.json
echo "Extracting versions from package.json..."
APP_VERSION=$(node -p "require('./package.json').version")
POSTGRES_VERSION=$(node -p "require('./package.json').docker.postgres")
REDIS_VERSION=$(node -p "require('./package.json').docker.redis")
POSTHOG_VERSION=$(node -p "require('./package.json').docker.posthog")

echo "Versions detected:"
echo "App: $APP_VERSION"
echo "Postgres: $POSTGRES_VERSION"
echo "Redis: $REDIS_VERSION"
echo "PostHog: $POSTHOG_VERSION"

# Create release directory
rm -rf release
mkdir -p release

# Create versions.env file
echo "Creating versions.env..."
cat > release/versions.env <<EOF
APP_VERSION=$APP_VERSION
POSTGRES_VERSION=$POSTGRES_VERSION
REDIS_VERSION=$REDIS_VERSION
POSTHOG_VERSION=$POSTHOG_VERSION
EOF

# Run tests
echo "Running unit tests..."
CI=true npm run test

echo "Running E2E tests..."
npm run test:e2e

# Pull dependency images
echo "Pulling dependency images..."
docker pull postgres:$POSTGRES_VERSION
docker pull redis:$REDIS_VERSION
docker pull posthog/posthog:$POSTHOG_VERSION

# Build App Docker image
echo "Building App Docker image..."
docker build -t learning-hub:$APP_VERSION .

# Save Docker images to separate files
echo "Saving Docker images to separate tar files..."

echo "Saving learning-hub:$APP_VERSION..."
docker save -o release/learning-hub-$APP_VERSION.tar learning-hub:$APP_VERSION

echo "Saving postgres:$POSTGRES_VERSION..."
docker save -o release/postgres-$POSTGRES_VERSION.tar postgres:$POSTGRES_VERSION

echo "Saving redis:$REDIS_VERSION..."
docker save -o release/redis-$REDIS_VERSION.tar redis:$REDIS_VERSION

echo "Saving posthog/posthog:$POSTHOG_VERSION..."
docker save -o release/posthog-$POSTHOG_VERSION.tar posthog/posthog:$POSTHOG_VERSION

# Copy production files
echo "Copying configuration files..."
cp docker-compose.production.yml release/
cp scripts/start.sh release/

# Make start script executable
chmod +x release/start.sh

# Create zip archive
echo "Creating release archive..."
zip -r learning-hub-release-$APP_VERSION.zip release

echo "Build complete! Artifact: learning-hub-release-$APP_VERSION.zip"
