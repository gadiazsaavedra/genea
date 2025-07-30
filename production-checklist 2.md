# Production Deployment Checklist

## ✅ COMPLETED
- [x] Remove outdated dependencies (firebase-admin, mongoose, postgres)
- [x] Generate new JWT_SECRET
- [x] Update JWT_SECRET in .env.production

## 🔴 CRITICAL - DO BEFORE DEPLOYMENT

### 1. Configure Gmail App Password
```bash
# Go to: https://myaccount.google.com/security
# Enable 2FA → Generate App Password for "Genea App"
# Update in .env.production:
EMAIL_PASSWORD=your-16-character-app-password
```

### 2. Get Supabase Database Password
```bash
# Go to: https://supabase.com/dashboard
# Select project → Settings → Database
# Copy connection string or reset password
# Update in .env.production:
DATABASE_URL=postgresql://postgres:REAL_PASSWORD@db.hsdjbqqijtxehepifbfk.supabase.co:5432/postgres
```

### 3. Create Supabase Tables
```sql
-- Run this SQL in Supabase SQL Editor:
-- (Use the create-supabase-tables.sql file we created)
```

### 4. Create Supabase Storage Bucket
```bash
# In Supabase Dashboard:
# Storage → Create bucket → Name: "genea-media" → Public: true
```

## 🟡 DEPLOYMENT STEPS

### 5. Deploy Backend to Render
1. Go to render.com → New Web Service
2. Connect GitHub repo
3. Root directory: `genea-app/server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from .env.production

### 6. Update Frontend Config
```bash
# After backend is deployed, update:
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### 7. Deploy Frontend to Netlify
1. Go to netlify.com → New site from Git
2. Connect GitHub repo
3. Base directory: `genea-app/client`
4. Build command: `npm run build`
5. Publish directory: `build`
6. Add environment variables from .env.production

## 📋 ENVIRONMENT VARIABLES FOR RENDER

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://hsdjbqqijtxehepifbfk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTE4NDQsImV4cCI6MjA2ODc4Nzg0NH0.q0KQo2E1KOG_0AL4D69PDD2gkVmx39V-_njV0anP2q0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIxMTg0NCwiZXhwIjoyMDY4Nzg3ODQ0fQ.OIsGPw9G2JlvwpFmCNLsuNh_CivLj9XspOJwZVyAWuA
JWT_SECRET=121b7ed7f96f28c27b48a9077730b0a16519a9b0f9aeb4505c77c708adc75260638a2e010b56df2d56fda1750f00df6a051a833b4f5dcb746c96bca4b09e90f2
JWT_EXPIRES_IN=7d
EMAIL_SERVICE=gmail
EMAIL_USER=gadiazsaavedra@gmail.com
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
DATABASE_URL=postgresql://postgres:YOUR_REAL_PASSWORD@db.hsdjbqqijtxehepifbfk.supabase.co:5432/postgres
FRONTEND_URL=https://your-frontend-url.netlify.app
UPLOAD_DIR=./uploads
```

## 🧪 TESTING BEFORE DEPLOYMENT

```bash
# Test locally first:
cd genea-app/server
npm install
npm start

# In another terminal:
cd genea-app/client  
npm install
npm start
```