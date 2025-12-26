import { execSync, spawnSync } from 'child_process';
import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Local database URL (when using Docker)
const LOCAL_DATABASE_URL = "postgresql://learninghub:learninghub@localhost:5432/learning_hub";

// Common Docker paths on macOS and Linux
const DOCKER_PATHS = [
    '/usr/local/bin/docker',
    '/opt/homebrew/bin/docker',
    '/Applications/Docker.app/Contents/Resources/bin/docker',
    '/usr/bin/docker',
];

function findDocker(): string | null {
    // Check if docker is in PATH
    for (const p of (process.env.PATH || '').split(':')) {
        const dockerPath = `${p}/docker`;
        if (fs.existsSync(dockerPath)) {
            return dockerPath;
        }
    }

    // Try common locations
    for (const dockerPath of DOCKER_PATHS) {
        if (fs.existsSync(dockerPath)) {
            return dockerPath;
        }
    }

    return null;
}

function getDatabaseUrlFromEnvFile(): string | null {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/^DATABASE_URL=["']?([^"'\n]+)["']?/m);
        if (match) {
            return match[1];
        }
    }
    return null;
}

async function globalSetup(config: FullConfig) {
    console.log('🚀 Setting up E2E test environment...');

    // Database URL priority:
    // 1. E2E_DATABASE_URL environment variable
    // 2. Docker local database (if Docker is available)
    // 3. DATABASE_URL from .env file

    let databaseUrl: string;
    let usingDocker = false;

    if (process.env.E2E_DATABASE_URL) {
        databaseUrl = process.env.E2E_DATABASE_URL;
        console.log('🔗 Using database from E2E_DATABASE_URL');
    } else {
        const dockerPath = findDocker();

        if (dockerPath) {
            console.log(`📍 Found Docker at: ${dockerPath}`);
            databaseUrl = LOCAL_DATABASE_URL;
            usingDocker = true;

            try {
                console.log('🐳 Starting PostgreSQL container...');
                execSync(`${dockerPath} compose up -d db`, {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                });

                // Wait for database to be ready
                console.log('⏳ Waiting for database to be ready...');
                let retries = 30;
                while (retries > 0) {
                    try {
                        const containerResult = spawnSync(dockerPath, ['ps', '-qf', 'name=db'], {
                            encoding: 'utf-8',
                        });
                        const containerId = containerResult.stdout.trim().split('\n')[0];

                        if (containerId) {
                            const readyResult = spawnSync(dockerPath, [
                                'exec', containerId,
                                'pg_isready', '-U', 'learninghub', '-d', 'learning_hub'
                            ], { encoding: 'utf-8' });

                            if (readyResult.status === 0) {
                                console.log('✅ Database is ready!');
                                break;
                            }
                        }
                    } catch {
                        // Ignore errors during wait
                    }

                    retries--;
                    if (retries === 0) {
                        throw new Error('Database failed to start after 30 attempts');
                    }
                    console.log(`  Waiting... (${30 - retries}/30)`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('❌ Failed to start Docker database:', error);
                throw error;
            }
        } else {
            // No Docker - fall back to .env DATABASE_URL
            const envDbUrl = getDatabaseUrlFromEnvFile();

            if (envDbUrl) {
                databaseUrl = envDbUrl;
                console.log('🔗 Docker not found. Using DATABASE_URL from .env file');
            } else {
                console.log('');
                console.log('❌ No database available for E2E tests.');
                console.log('');
                console.log('💡 To run E2E tests, you need one of the following:');
                console.log('   1. Install Docker: brew install --cask docker');
                console.log('   2. Set E2E_DATABASE_URL environment variable');
                console.log('   3. Configure DATABASE_URL in .env file');
                console.log('');
                throw new Error('No database available for E2E tests');
            }
        }
    }

    const env = {
        ...process.env,
        DATABASE_URL: databaseUrl,
    };

    try {
        // Run migrations
        console.log('📦 Running database migrations...');
        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            env,
        });

        // Seed the database
        console.log('🌱 Seeding database with test data...');
        execSync('npx prisma db seed', {
            stdio: 'inherit',
            env,
        });

        console.log('✅ E2E environment setup complete!');
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }

    // Store database URL for the web server
    process.env.DATABASE_URL = databaseUrl;
}

export default globalSetup;
