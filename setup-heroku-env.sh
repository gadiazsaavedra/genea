#!/bin/bash
# Script to set up Heroku environment variables

echo "Setting up Heroku environment variables..."

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=8080
heroku config:set SUPABASE_URL=https://hsdjbqqijtxehepifbfk.supabase.co
heroku config:set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTE4NDQsImV4cCI6MjA2ODc4Nzg0NH0.q0KQo2E1KOG_0AL4D69PDD2gkVmx39V-_njV0anP2q0
heroku config:set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIxMTg0NCwiZXhwIjoyMDY4Nzg3ODQ0fQ.OIsGPw9G2JlvwpFmCNLsuNh_CivLj9XspOJwZVyAWuA
heroku config:set JWT_SECRET=df94a4891b67caa21793749d280350beaf0d2d085ad077173c816abf5953f228d2e8a00a18e5f80c112ac94c52b82ec3b99418f3b162a9f531dd92d6a5f007b7
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set UPLOAD_DIR=./uploads
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=gadiazsaavedra@gmail.com

# These need to be set manually with real values:
echo ""
echo "⚠️  IMPORTANT: Set these manually with real values:"
echo "heroku config:set EMAIL_PASSWORD=your-gmail-app-password"
echo "heroku config:set DATABASE_URL=your-real-database-url"
echo "heroku config:set FRONTEND_URL=your-frontend-url"

echo ""
echo "✅ Basic environment variables set!"