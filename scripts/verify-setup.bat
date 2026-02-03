@echo off
echo ===================================
echo PAStools Platform Setup Verification
echo ===================================
echo.

echo Checking Node.js version...
node -v
echo.

echo Checking Docker...
docker --version
echo.

echo Checking Docker Compose...
docker-compose --version
echo.

echo Verifying project structure...
if exist "packages\backend" (echo [OK] packages\backend exists) else (echo [MISSING] packages\backend)
if exist "packages\frontend" (echo [OK] packages\frontend exists) else (echo [MISSING] packages\frontend)
if exist "packages\shared" (echo [OK] packages\shared exists) else (echo [MISSING] packages\shared)
if exist "packages\backend\src" (echo [OK] packages\backend\src exists) else (echo [MISSING] packages\backend\src)
if exist "packages\frontend\src" (echo [OK] packages\frontend\src exists) else (echo [MISSING] packages\frontend\src)
if exist "packages\shared\src" (echo [OK] packages\shared\src exists) else (echo [MISSING] packages\shared\src)
echo.

echo Verifying configuration files...
if exist "docker-compose.yml" (echo [OK] docker-compose.yml exists) else (echo [MISSING] docker-compose.yml)
if exist "packages\backend\package.json" (echo [OK] packages\backend\package.json exists) else (echo [MISSING] packages\backend\package.json)
if exist "packages\frontend\package.json" (echo [OK] packages\frontend\package.json exists) else (echo [MISSING] packages\frontend\package.json)
if exist "packages\shared\package.json" (echo [OK] packages\shared\package.json exists) else (echo [MISSING] packages\shared\package.json)
if exist "packages\backend\.env.example" (echo [OK] packages\backend\.env.example exists) else (echo [MISSING] packages\backend\.env.example)
if exist "packages\frontend\.env.example" (echo [OK] packages\frontend\.env.example exists) else (echo [MISSING] packages\frontend\.env.example)
echo.

echo ===================================
echo Setup verification complete!
echo ===================================
echo.
echo Next steps:
echo 1. Install dependencies: npm install
echo 2. Copy environment files:
echo    copy packages\backend\.env.example packages\backend\.env
echo    copy packages\frontend\.env.example packages\frontend\.env
echo 3. Start Docker services: npm run docker:up
echo 4. Start backend: npm run backend:dev
echo 5. Start frontend: npm run frontend:dev
pause
