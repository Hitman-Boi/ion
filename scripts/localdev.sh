#!/bin/bash

# ===========================================
# Local Development Startup Script
# ===========================================
# This script:
# 1. Starts docker containers (PostgreSQL, Redis, PostHog) if not running
# 2. Copies .env.localdev to .env if .env doesn't exist
# 3. Installs npm dependencies
# 4. Runs Prisma migrations and seeds the database
# 5. Starts the Next.js dev server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "🚀 Learning Hub - Local Development Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Corporate proxy/firewall workaround
# Disables strict SSL certificate checking for npm/node
# This is needed in environments with self-signed certificates or MITM proxies
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if containers are already running
DB_RUNNING=$(docker ps --filter "name=learning-hub-localdev-db" --format '{{.Names}}' 2>/dev/null || echo "")

if [ -z "$DB_RUNNING" ]; then
    echo -e "${YELLOW}📦 Starting Docker containers...${NC}"
    docker compose -f docker-compose.localdev.yml up -d
    
    # Wait for PostgreSQL to be healthy
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    MAX_RETRIES=30
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if docker exec learning-hub-localdev-db pg_isready -U postgres -d learning_hub > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ PostgreSQL failed to start in time. Check docker logs.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker containers already running${NC}"
fi

# Copy .env.localdev to .env if .env doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📋 Copying .env.localdev to .env...${NC}"
    cp .env.localdev .env
    echo -e "${GREEN}✅ Created .env from .env.localdev${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
npm install

# Run Prisma migrations
echo -e "${YELLOW}🔄 Running Prisma migrations...${NC}"
npx prisma migrate dev --name init 2>/dev/null || npx prisma db push

# Generate Prisma client (done by postinstall, but just in case)
npx prisma generate

# Seed the database
echo -e "${YELLOW}🌱 Seeding database...${NC}"
npx prisma db seed 2>/dev/null || echo -e "${YELLOW}⚠️  Seed skipped (may already exist)${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Local development environment is ready!"
echo "==========================================${NC}"
echo ""
echo "Services:"
echo "  • App:     http://localhost:3000"
echo "  • PostHog: http://localhost:8000"
echo "  • DB:      postgresql://postgres:postgres@localhost:5432/learning_hub"
echo ""
echo -e "${YELLOW}Starting Next.js dev server...${NC}"
echo ""

# Start the dev server
npm run dev
