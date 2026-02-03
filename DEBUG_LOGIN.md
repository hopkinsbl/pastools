# Login Issue Debugging Guide

## Problem
Login screen flashes and returns to login page after attempting to log in.

## Root Cause
Race condition: After successful login, navigation happens before the user state is updated in AuthContext, causing ProtectedRoute to redirect back to login.

## Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check for:
- Network errors (failed API calls)
- JavaScript errors
- CORS issues

### 2. Check Backend is Running
```bash
# Check if backend is responding
curl http://localhost:3000/api/auth/me
# Should return 401 Unauthorized (expected without token)
```

### 3. Check Database Connection
```bash
# Check if PostgreSQL is running
docker ps
# Should show postgres, redis, and minio containers
```

### 4. Test Login API Directly
```bash
# First, register a test user (if not already done)
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"testpass123\",\"email\":\"test@example.com\",\"fullName\":\"Test User\"}"

# Then test login
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"testpass123\"}"
```

### 5. Check Frontend Environment
```bash
# Verify VITE_API_URL is set correctly
cd packages/frontend
type .env
# Should have: VITE_API_URL=http://localhost:3000
```

## Quick Fix

The issue is in the login flow. After login, we need to ensure the user state is set before navigation.

### Option 1: Fix AuthContext (Recommended)
Update the login function to set user state immediately after getting the token.

### Option 2: Add Delay (Temporary)
Add a small delay before navigation to allow state to update.

### Option 3: Check Token on Mount
Ensure the /api/auth/me endpoint is working correctly.

## Common Issues

1. **Backend not running**: Start with `npm run backend:dev`
2. **Database not running**: Start with `npm run docker:up`
3. **CORS errors**: Check backend CORS configuration
4. **Wrong API URL**: Check VITE_API_URL in frontend/.env
5. **JWT secret not set**: Check JWT_SECRET in backend/.env

## Next Steps

Run the debugging steps above and report:
1. Any console errors
2. Network tab status codes
3. Whether curl commands work
