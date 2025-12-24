# Learning Hub Test Documentation

## Architecture

The Learning Hub application follows a modular architecture with these key components:

- **Frontend**: Built using Next.js for server-side rendering and client-side interactivity.  
- **Authentication**: Manages user authentication and authorization using secure session handling.  
- **API Routes**: Provides RESTful endpoints for course management, user interactions, and health checks.  
- **Database**: Uses PostgreSQL for data storage, managed via Prisma ORM.  
- **Testing**: Comprehensive test coverage with Vitest for unit and integration tests, and Playwright for E2E tests.  
- **Monitoring**: Prometheus is used for metrics collection and monitoring application performance.

This architecture ensures scalability, maintainability, and robustness of the application.

## Local Development

### Prerequisites

- **Node.js**: Version 18.17.0 or later.
- **Docker**: For running the database locally.

### Setup and Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   Start the PostgreSQL database using Docker Compose:
   ```bash
   docker-compose up -d db
   ```
   
   Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
   
   Push the database schema:
   ```bash
   npx prisma db push
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

### Running Tests

- **Unit Tests**: `npm test`
- **Integration Tests**: `npm run test:integration`
- **E2E Tests**: `npm run test:e2e`


## Deployment

To deploy the Learning Hub application:

1. **Set up environment variables**: Create a `.env` file with the necessary deployment configuration.  
2. **Build the application**:  
   ```bash
   npm run build
   ```
3. **Start the production server**:  
   ```bash
   npm start
   ```
4. **Monitor the application**: Use Prometheus to monitor application performance and health.

The application will be accessible at the configured domain or IP.

## Onboarding

To get started:

1. **Clone the repository** from your source control system.  
2. **Install dependencies**:  
   ```bash
   npm install
   ```
3. **Set up environment variables**: Create a `.env` file with configuration for your environment.  
4. **Set up the database**:  
   ```bash
   npx prisma migrate dev
   ```
5. **Start the development server**:  
   ```bash
   npm run dev
   ```
6. **Access the application**: Open `http://localhost:3000` in your browser.

This will set up the app for development and testing.

## Testing Strategy

### Test Coverage Goals
- Unit Tests (60%): Utility functions and permission checks  
- API Integration Tests (30%): Authentication, course management, enrollment flows  
- E2E Tests (10%): Critical user journeys (login  course creation  enrollment)  

### Test Infrastructure & Tools
- Unit and Integration Tests: Vitest  
- E2E Tests: Playwright  

### Test Environment Configuration
- Separate test database configured in `.env.test` using Prisma  
- Authentication and session mocks implemented in `jest.setup.ts`  

### Running Tests
- Unit: `npm test`  
- Integration: `npm run test:integration`  
- E2E: `npx playwright test`  

### Test Coverage Reports
- Vitest: `coverage/` directory  
- Playwright: `test-results/` directory  

### Best Practices
- Isolate each test  
- Use mocks for external dependencies  
- Clean up test data after each test  
- Keep documentation updated  

## Local Deployment with Docker Compose

### Configuration Overview

- **PostgreSQL**: Official image with persistent volume `db_data`  
- **App Service**: Built from current directory, connects to PostgreSQL  
- **Health Checks**: For database (`pg_isready`) and app (`curl` health endpoint)  
- **Network & Ports**: Custom Docker network, app on port 3000, PostgreSQL on 5432  

### Usage

- Start services:  
  ```bash
  docker-compose up
  ```
- Stop services:  
  ```bash
  docker-compose down
  ```
- Customize config by editing `docker-compose.yml` (e.g., ports, images, health checks)

### Environment Variables

Create a `.env` file with:

```env
POSTGRES_USER=your_postgres_user (DB_USERNAME)
POSTGRES_PASSWORD=your_postgres_password (DB_PASSWORD)
POSTGRES_DB=learning_hub (DB_NAME)
```

### Monitoring & Troubleshooting

- Use `docker stats` for resource usage  
- Check logs and health with `docker logs` and `docker inspect`  
- Verify environment variables with `docker-compose config`  
- Rebuild containers with `docker-compose build`  

### Useful Links

- [Docker Compose Documentation](https://docs.docker.com/compose/)  
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)  
- [Docker Volumes](https://docs.docker.com/storage/volumes/)  
- [Docker Networks](https://docs.docker.com/network/)
