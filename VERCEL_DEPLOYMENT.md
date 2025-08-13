# Vercel Deployment Guide

## Environment Variables Required

When deploying to Vercel, you need to set the following environment variables in your Vercel dashboard:

### Required Environment Variables

1. **DATABASE_URL**
   - Your PostgreSQL database connection string
   - Example: `postgresql://username:password@host:port/database?sslmode=require`
   - Current: Your Neon database URL

2. **JWT_SECRET**
   - Secret key for JWT token signing
   - Should be a long, random string
   - Current: Your existing JWT secret

3. **NODE_ENV**
   - Set to `production` for production deployment
   - Value: `production`

4. **VITE_API_URL**
   - The URL where your API will be accessible
   - For Vercel: `https://your-app-name.vercel.app/api`
   - Replace `your-app-name` with your actual Vercel app name

### Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Make sure to set them for Production, Preview, and Development environments

### Current Environment Variables from .env

```
PORT=3001                    # Not needed for Vercel (auto-assigned)
DATABASE_URL=your_neon_url   # Copy this to Vercel
JWT_SECRET=your_jwt_secret   # Copy this to Vercel
NODE_ENV=development         # Set to 'production' in Vercel
VITE_API_URL=http://localhost:3001/api  # Update to your Vercel URL
```

## Database Considerations

- Your Neon PostgreSQL database should work fine with Vercel
- Make sure your database allows connections from Vercel's IP ranges
- Consider running database migrations if needed

## Build Configuration

The project is configured with:
- `vercel.json` for routing and build configuration
- `vercel-build` script in package.json
- Proper CORS configuration for Vercel domains

## Deployment Steps

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard
5. Redeploy if needed: `vercel --prod`
