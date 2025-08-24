# Medify Frontend Deployment Guide

## Quick Deployment with Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
# or use npx for one-time use
npx vercel
```

### Step 2: Build the project
```bash
cd frontend
npm run build
```

### Step 3: Deploy to Vercel
```bash
vercel --prod
```

## Environment Variables for Production
Add these in Vercel dashboard:
- `VITE_API_BASE_URL=https://your-backend-url.com`

## Automatic Deployment
Connect your GitHub repo to Vercel for automatic deployments on push.

## Current Configuration
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite (React)
