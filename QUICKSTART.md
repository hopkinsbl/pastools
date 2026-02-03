# PAStools Platform - Quick Start Guide

This guide will help you get the PAStools platform up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20 LTS** or higher ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (optional, for version control)

## Step 1: Verify Setup

Run the verification script to check your environment:

**Windows:**
```cmd
scripts\verify-setup.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/verify-setup.sh
./scripts/verify-setup.sh
```

## Step 2: Install Dependencies

Use the installation script for easy setup:

**Windows:**
```cmd
scripts\install-all.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/install-all.sh
./scripts/install-all.sh
```

Or install manually:

```bash
npm install
cd packages/backend && npm install
cd ../frontend && npm install
cd ../shared && npm install
cd ../..
```

## Step 3: Configure Environment

Copy the example environment files:

**Windows:**
```cmd
copy packages\backend\.env.example packages\backend\.env
copy packages\frontend\.env.example packages\frontend\.env
```

**Linux/Mac:**
```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

## Step 4: Start Infrastructure Services

Start PostgreSQL, Redis, and MinIO using Docker Compose:

```bash
npm run docker:up
```

Wait for all services to be healthy (about 30 seconds). You can check the logs:

```bash
npm run docker:logs
```

## Step 5: Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
```

## Step 6: Access the Application

Once both servers are running, you can access:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **MinIO Console**: http://localhost:9001

## Default Credentials

### Database (PostgreSQL)
- Host: `localhost:5432`
- Database: `pastools`
- Username: `pastools`
- Password: `pastools_dev_password`

### Object Storage (MinIO)
- Console URL: http://localhost:9001
- Access Key: `pastools`
- Secret Key: `pastools_dev_password`

### Redis
- Host: `localhost:6379`
- No password required in development

## Troubleshooting

### Port Already in Use

If you get port conflicts, you can modify the ports in `docker-compose.yml`:

- PostgreSQL: Change `5432:5432` to `5433:5432` (or any available port)
- Redis: Change `6379:6379` to `6380:6379`
- MinIO: Change `9000:9000` and `9001:9001`

Then update the corresponding environment variables in `packages/backend/.env`.

### Docker Services Not Starting

Check Docker Desktop is running and has sufficient resources:
- Minimum 4GB RAM allocated
- Minimum 2 CPU cores

### Backend Won't Start

1. Ensure Docker services are running: `docker-compose ps`
2. Check database connection in `packages/backend/.env`
3. View backend logs for specific errors

### Frontend Won't Start

1. Ensure backend is running on port 3000
2. Check `packages/frontend/.env` has correct API URL
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Next Steps

Now that your development environment is running:

1. Review the [README.md](README.md) for detailed documentation
2. Check the [Design Document](.kiro/specs/pastools-platform/design.md) for architecture details
3. Review the [Requirements](.kiro/specs/pastools-platform/requirements.md)
4. Start implementing tasks from [tasks.md](.kiro/specs/pastools-platform/tasks.md)

## Stopping the Application

To stop all services:

1. Stop the backend and frontend servers (Ctrl+C in each terminal)
2. Stop Docker services:
   ```bash
   npm run docker:down
   ```

## Development Workflow

1. Make code changes in `packages/backend/src` or `packages/frontend/src`
2. Both servers support hot reload - changes will be reflected automatically
3. Run tests: `npm run test` in the respective package directory
4. Build for production: `npm run build` in the respective package directory

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review the API documentation at http://localhost:3000/api/docs
- Check Docker logs: `npm run docker:logs`
- Review the spec documents in `.kiro/specs/pastools-platform/`

Happy coding! 🚀
