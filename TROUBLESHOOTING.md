# PAStools Platform - Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Compose Command Not Found

**Symptoms:**
```
'docker-compose' is not recognized as an internal or external command
```
or
```
docker compose: command not found
```

**Solutions:**

**Option A: Update Docker Desktop (Recommended)**
1. Download latest Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and restart
3. Docker Compose V2 is included

**Option B: Install Docker Compose Plugin**

*Ubuntu/Debian:*
```bash
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

*Mac with Homebrew:*
```bash
brew install docker-compose
```

*Windows:*
Docker Compose is included with Docker Desktop. Ensure Docker Desktop is running.

**Verify Installation:**
```bash
docker compose version
```

### 2. Port Already in Use

**Symptoms:**
```
Error: bind: address already in use
```

**Solution:**

**Find what's using the port:**

*Windows:*
```cmd
netstat -ano | findstr :5432
netstat -ano | findstr :6379
netstat -ano | findstr :9000
```

*Linux/Mac:*
```bash
lsof -i :5432
lsof -i :6379
lsof -i :9000
```

**Option A: Stop the conflicting service**

*Windows:*
```cmd
taskkill /PID <PID> /F
```

*Linux/Mac:*
```bash
kill -9 <PID>
```

**Option B: Change ports in docker-compose.yml**

Edit `docker-compose.yml`:
```yaml
postgres:
  ports:
    - "5433:5432"  # Changed from 5432:5432

redis:
  ports:
    - "6380:6379"  # Changed from 6379:6379

minio:
  ports:
    - "9001:9000"  # Changed from 9000:9000
    - "9002:9001"  # Changed from 9001:9001
```

Then update `packages/backend/.env`:
```
DATABASE_PORT=5433
REDIS_PORT=6380
S3_ENDPOINT=http://localhost:9001
```

### 3. npm install Fails with Permission Errors

**Symptoms:**
```
EACCES: permission denied
```

**Solutions:**

*Linux/Mac:*
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Clear npm cache
npm cache clean --force

# Try again
npm install
```

*Windows:*
1. Run Command Prompt or PowerShell as Administrator
2. Run the install script again

### 4. Docker Services Won't Start

**Symptoms:**
```
Container exited with code 1
```

**Solutions:**

**Check Docker is running:**
```bash
docker ps
```

**Check Docker resources:**
1. Open Docker Desktop
2. Go to Settings → Resources
3. Ensure at least:
   - 4GB RAM
   - 2 CPU cores
   - 20GB disk space

**View service logs:**
```bash
npm run docker:logs
```

**Restart services:**
```bash
npm run docker:down
npm run docker:up
```

**Reset everything:**
```bash
npm run docker:down
docker volume prune -f
npm run docker:up
```

### 5. Backend Won't Start

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

**Check database is running:**
```bash
docker ps | grep postgres
```

**Check environment file exists:**
```bash
# Windows
dir packages\backend\.env

# Linux/Mac
ls -la packages/backend/.env
```

**Create if missing:**
```cmd
copy packages\backend\.env.example packages\backend\.env
```

**Verify database connection:**
```bash
# Install PostgreSQL client
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Test connection
psql -h localhost -U pastools -d pastools
# Password: pastools_dev_password
```

**Check backend logs:**
```bash
cd packages/backend
npm run start:dev
```

### 6. Frontend Won't Start

**Symptoms:**
```
Failed to resolve import
```
or
```
ECONNREFUSED connecting to backend
```

**Solutions:**

**Check backend is running:**
```bash
curl http://localhost:3000
```

**Check environment file:**
```cmd
copy packages\frontend\.env.example packages\frontend\.env
```

**Clear cache and reinstall:**
```bash
cd packages/frontend
rm -rf node_modules
rm -rf dist
npm install
npm run dev
```

**Check Vite config:**
Ensure `packages/frontend/vite.config.ts` has correct proxy:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

### 7. Module Not Found Errors

**Symptoms:**
```
Cannot find module '@nestjs/common'
```
or
```
Cannot find module 'react'
```

**Solutions:**

**Reinstall all dependencies:**
```cmd
scripts\install-all.bat
```

**Or manually:**
```bash
# Root
npm install

# Backend
cd packages/backend
rm -rf node_modules
npm install

# Frontend
cd ../frontend
rm -rf node_modules
npm install

# Shared
cd ../shared
rm -rf node_modules
npm install
```

### 8. TypeScript Errors

**Symptoms:**
```
TS2307: Cannot find module
```

**Solutions:**

**Rebuild TypeScript:**
```bash
cd packages/backend
npm run build

cd ../frontend
npm run build
```

**Check tsconfig.json:**
Ensure `tsconfig.json` files are present in each package.

**Clear TypeScript cache:**
```bash
# Delete all .tsbuildinfo files
find . -name "*.tsbuildinfo" -delete

# Or on Windows
del /s *.tsbuildinfo
```

### 9. Docker Build Fails

**Symptoms:**
```
ERROR [internal] load metadata for docker.io/library/node:20-alpine
```

**Solutions:**

**Check internet connection:**
```bash
ping docker.io
```

**Login to Docker Hub:**
```bash
docker login
```

**Pull base image manually:**
```bash
docker pull node:20-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull minio/minio:latest
```

**Clear Docker cache:**
```bash
docker system prune -a
```

### 10. MinIO Not Accessible

**Symptoms:**
```
Cannot access MinIO console at http://localhost:9001
```

**Solutions:**

**Check MinIO is running:**
```bash
docker ps | grep minio
```

**Check MinIO logs:**
```bash
docker logs pastools-minio
```

**Access MinIO:**
1. Open http://localhost:9001
2. Username: `pastools`
3. Password: `pastools_dev_password`

**Create bucket manually:**
```bash
# Install MinIO client
# Windows: Download from min.io
# Mac: brew install minio/stable/mc
# Linux: wget https://dl.min.io/client/mc/release/linux-amd64/mc

# Configure
mc alias set local http://localhost:9000 pastools pastools_dev_password

# Create bucket
mc mb local/pastools-files
```

### 11. Hot Reload Not Working

**Symptoms:**
Changes to code don't reflect in the running application.

**Solutions:**

**Backend:**
```bash
# Stop and restart
cd packages/backend
npm run start:dev
```

**Frontend:**
```bash
# Stop and restart
cd packages/frontend
npm run dev
```

**Check file watchers (Linux):**
```bash
# Increase file watch limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 12. Database Migration Errors

**Symptoms:**
```
QueryFailedError: relation "users" does not exist
```

**Solutions:**

**Run migrations:**
```bash
cd packages/backend
npm run migration:run
```

**Reset database:**
```bash
# Stop services
npm run docker:down

# Remove volumes
docker volume rm pastools-platform_postgres_data

# Start fresh
npm run docker:up

# Wait 30 seconds, then run migrations
cd packages/backend
npm run migration:run
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs:**
   ```bash
   npm run docker:logs
   ```

2. **Verify setup:**
   ```cmd
   scripts\verify-setup.bat
   ```

3. **Review documentation:**
   - [README.md](README.md)
   - [QUICKSTART.md](QUICKSTART.md)
   - [FIXES_APPLIED.md](FIXES_APPLIED.md)

4. **Check system requirements:**
   - Node.js 20 LTS or higher
   - Docker Desktop with 4GB RAM minimum
   - 20GB free disk space
   - Windows 10/11, macOS 10.15+, or Linux

5. **Clean slate:**
   ```bash
   # Stop everything
   npm run docker:down
   
   # Remove all Docker data
   docker system prune -a --volumes
   
   # Reinstall dependencies
   scripts\install-all.bat
   
   # Start fresh
   npm run docker:up
   ```

## Quick Reference

### Useful Commands

```bash
# Docker
npm run docker:up          # Start services
npm run docker:down        # Stop services
npm run docker:logs        # View logs
docker ps                  # List running containers
docker logs <container>    # View container logs

# Development
npm run backend:dev        # Start backend
npm run frontend:dev       # Start frontend
npm run backend:build      # Build backend
npm run frontend:build     # Build frontend

# Database
cd packages/backend
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert

# Testing
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage
```

### Default Credentials

**PostgreSQL:**
- Host: localhost:5432
- Database: pastools
- User: pastools
- Password: pastools_dev_password

**Redis:**
- Host: localhost:6379
- No password

**MinIO:**
- Console: http://localhost:9001
- Access Key: pastools
- Secret Key: pastools_dev_password

### Access Points

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- MinIO Console: http://localhost:9001
