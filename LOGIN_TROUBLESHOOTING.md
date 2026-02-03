# Login Troubleshooting Guide

## Issue Fixed
The main issue was a field name mismatch between backend and frontend:
- Backend returns: `accessToken` (camelCase)
- Frontend was expecting: `access_token` (snake_case)

This has been fixed in `packages/frontend/src/contexts/AuthContext.tsx`.

## How to Test

1. **Start the backend** (if not running):
   ```bash
   cd packages/backend
   npm run start:dev
   ```

2. **Start the frontend** (if not running):
   ```bash
   cd packages/frontend
   npm run dev
   ```

3. **Open browser to** http://localhost:5173

4. **Open Developer Tools** (F12) and go to Console tab

5. **Try logging in** with test credentials

## Troubleshooting Steps

### 1. Check Browser Console
Look for:
- Red error messages
- Failed network requests
- CORS errors
- JavaScript exceptions

### 2. Check Network Tab
Filter for `/api/auth/login`:
- **Status 200**: Login request succeeded
- **Status 401**: Invalid credentials
- **Status 500**: Server error
- **Failed/CORS**: Backend not running or wrong URL

Check the response body - should look like:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

### 3. Check Backend is Running
```bash
# Should show backend listening on port 3000
curl http://localhost:3000/api/auth/login
```

### 4. Check Database Connection
```bash
# Connect to postgres
docker exec -it pastools-postgres psql -U pastools -d pastools

# Check if users table exists
\dt

# Check if any users exist
SELECT id, username, email FROM users;

# Exit
\q
```

### 5. Create Test User (if needed)
If no users exist, you need to register one first:

**Option A: Use the register endpoint**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "fullName": "Admin User"
  }'
```

**Option B: Use Swagger UI**
1. Go to http://localhost:3000/api/docs
2. Find POST /api/auth/register
3. Click "Try it out"
4. Fill in the fields and execute

### 6. Common Issues

**Issue: "Cannot read property 'accessToken' of undefined"**
- Backend returned wrong format or error
- Check Network tab response

**Issue: Page flashes and returns to login**
- Token not being saved to localStorage
- `/api/auth/me` endpoint failing
- Check Console for errors

**Issue: CORS error**
- Backend not configured for frontend URL
- Check backend CORS settings in `main.ts`

**Issue: 401 Unauthorized after login**
- JWT secret mismatch
- Token not being sent in Authorization header
- Check `.env` file has `JWT_SECRET`

**Issue: Network error / Connection refused**
- Backend not running
- Wrong API URL in frontend
- Check `VITE_API_URL` in frontend `.env`

### 7. Environment Variables

**Backend** (`packages/backend/.env`):
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pastools
DATABASE_USER=pastools
DATABASE_PASSWORD=pastools123
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-in-production
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=pastools
```

**Frontend** (`packages/frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 8. Quick Test Commands

```bash
# Test backend health
curl http://localhost:3000

# Test login endpoint exists
curl -X POST http://localhost:3000/api/auth/login

# Test with credentials (replace with your user)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Next Steps After Fix

1. Restart the frontend dev server (Ctrl+C and `npm run dev`)
2. Clear browser cache and localStorage (F12 > Application > Local Storage > Clear)
3. Try logging in again
4. Check Console and Network tabs for any remaining errors
