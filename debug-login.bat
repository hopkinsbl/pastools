@echo off
echo ========================================
echo PAStools Login Debugging Script
echo ========================================
echo.

echo [1/6] Checking Docker containers...
docker ps
echo.

echo [2/6] Testing backend health...
curl -s http://localhost:3000/api/auth/me
echo.
echo (401 Unauthorized is expected - backend is responding)
echo.

echo [3/6] Checking backend .env file...
if exist packages\backend\.env (
    echo Backend .env exists
    findstr /C:"JWT_SECRET" packages\backend\.env >nul
    if %errorlevel%==0 (
        echo JWT_SECRET is configured
    ) else (
        echo WARNING: JWT_SECRET not found in .env
    )
) else (
    echo WARNING: Backend .env file not found!
    echo Copy packages\backend\.env.example to packages\backend\.env
)
echo.

echo [4/6] Checking frontend .env file...
if exist packages\frontend\.env (
    echo Frontend .env exists
    type packages\frontend\.env | findstr VITE_API_URL
) else (
    echo WARNING: Frontend .env file not found!
    echo Copy packages\frontend\.env.example to packages\frontend\.env
)
echo.

echo [5/6] Testing user registration (creating testuser)...
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"testpass123\",\"email\":\"test@example.com\",\"fullName\":\"Test User\"}"
echo.
echo.

echo [6/6] Testing login with testuser...
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"testpass123\"}"
echo.
echo.

echo ========================================
echo Debugging complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check if all containers are running (postgres, redis, minio)
echo 2. Verify backend responded to health check
echo 3. Check if login returned an access_token
echo 4. Open browser DevTools (F12) and check Console and Network tabs
echo 5. Try logging in again and watch for errors
echo.
pause
