# Environment Variables Setup Guide

## Problem
If your remote frontend is connecting to your local backend instead of the remote backend, it means the `NEXT_PUBLIC_NODE_API_BASE_URL` environment variable is not set correctly.

## Solution

### 1. Set the Environment Variable

Create a `.env.local` file in the `sozodigi-irish` directory (frontend root) with the following:

```bash
# Backend API URL - Replace with your actual remote backend URL
NEXT_PUBLIC_NODE_API_BASE_URL=https://your-remote-backend-url.com

# Example for production:
# NEXT_PUBLIC_NODE_API_BASE_URL=https://api.sozodigicare.com

# For local development, you can use:
# NEXT_PUBLIC_NODE_API_BASE_URL=http://localhost:5000
```

### 2. Other Required Environment Variables

Make sure you also have these set:

```bash
# Socket.io URL (should match your backend)
NEXT_PUBLIC_SOCKET_URL=wss://your-remote-backend-url.com

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# ReCAPTCHA (if using)
NEXT_PUBLIC_CAPTCHA_KEY=your_recaptcha_site_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-frontend-url.com
```

### 3. For Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Go to your deployment platform's environment variables settings
2. Add `NEXT_PUBLIC_NODE_API_BASE_URL` with your remote backend URL
3. Make sure to use `https://` (not `http://`) for production
4. Redeploy your application

### 4. Verify the Configuration

After setting the environment variable:

1. Restart your development server or redeploy
2. Check the browser console - you should NOT see warnings about localhost
3. Check the Network tab - API requests should go to your remote backend URL

## Important Notes

- **Never commit `.env.local` to git** - it's already in `.gitignore`
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Make sure your backend CORS settings allow requests from your frontend domain
- The backend URL should NOT include a trailing slash

## Troubleshooting

### Frontend still connecting to localhost?

1. Check that `.env.local` exists and has the correct variable
2. Restart your Next.js dev server (`npm run dev`)
3. Clear your browser cache
4. Check the browser console for errors
5. Verify the environment variable is being read: Add `console.log(process.env.NEXT_PUBLIC_NODE_API_BASE_URL)` temporarily

### Getting CORS errors?

Make sure your backend's CORS configuration (in `utils/cors.js`) includes your frontend domain in the `allowedOrigins` array.

