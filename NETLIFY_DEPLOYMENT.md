# Netlify Deployment Guide

This guide will help you deploy PinoyPantry Client to Netlify.

## Prerequisites

- ✅ Netlify account (free tier works)
- ✅ GitHub repository with your code
- ✅ Shopify Storefront API credentials

## Step 1: Set Up Environment Variables in Netlify

**⚠️ CRITICAL:** You must set these environment variables in Netlify, otherwise your site will fail to load!

### How to Add Environment Variables:

1. Go to your Netlify dashboard
2. Select your site (or create a new one)
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable** and add each of these:

#### Required Variables:

```
VITE_SHOPIFY_STORE_DOMAIN=pinoy-pantry-2.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_actual_token_here
VITE_SHOPIFY_API_VERSION=2025-07
VITE_USE_MOCK_DATA=false
VITE_MAINTENANCE_MODE=false
```

**Important Notes:**
- Replace `your_actual_token_here` with your actual Storefront API access token
- Make sure there are **no quotes** around the values
- These are **case-sensitive**

### Environment Variable Details:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SHOPIFY_STORE_DOMAIN` | Your Shopify store domain | `pinoy-pantry-2.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API token | `shpat_abc123...` |
| `VITE_SHOPIFY_API_VERSION` | Shopify API version | `2025-07` |
| `VITE_USE_MOCK_DATA` | Use mock data (set to `false` for production) | `false` |
| `VITE_MAINTENANCE_MODE` | Enable maintenance page | `false` |

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended for first time)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub** and authorize Netlify
   - Select your `PinoyPantry.Client` repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `build`
   - Click **"Deploy site"**

3. **Add Environment Variables:**
   - After the first deploy (it will fail without env vars), go to **Site settings** → **Environment variables**
   - Add all the variables listed above
   - Click **"Trigger deploy"** to redeploy with the new variables

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize Netlify:**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site

4. **Set Environment Variables:**
   ```bash
   netlify env:set VITE_SHOPIFY_STORE_DOMAIN "pinoy-pantry-2.myshopify.com"
   netlify env:set VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN "your_token_here"
   netlify env:set VITE_SHOPIFY_API_VERSION "2025-07"
   netlify env:set VITE_USE_MOCK_DATA "false"
   netlify env:set VITE_MAINTENANCE_MODE "false"
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Verify Deployment

After deployment:

1. Visit your Netlify site URL (e.g., `https://your-site.netlify.app`)
2. Check the browser console (F12) for any errors
3. Verify that products are loading from your Shopify store

## Troubleshooting

### Error: "storeDomain is required"

**Problem:** Environment variables are not set in Netlify.

**Solution:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Make sure all required variables are set
3. Redeploy your site

### Error: "401 Unauthorized"

**Problem:** Invalid or missing Storefront API token.

**Solution:**
1. Verify your token in Shopify Admin
2. Make sure the token is correctly set in Netlify environment variables
3. Check that there are no extra spaces or quotes

### Products Not Loading

**Problem:** API version mismatch or incorrect store domain.

**Solution:**
1. Verify `VITE_SHOPIFY_STORE_DOMAIN` matches your store (e.g., `pinoy-pantry-2.myshopify.com`)
2. Check `VITE_SHOPIFY_API_VERSION` matches your package version (`2025-07`)
3. Check browser console for specific error messages

### Site Shows Maintenance Page

**Problem:** `VITE_MAINTENANCE_MODE` is set to `true`.

**Solution:**
1. Go to Netlify → Environment variables
2. Set `VITE_MAINTENANCE_MODE` to `false`
3. Redeploy

## Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's instructions to configure DNS

## Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Run build with your environment variables
- ✅ Show preview deployments for pull requests

## Environment Variables for Different Environments

You can set different values for:
- **Production:** Default values
- **Branch deploys:** Different values for preview deployments
- **Deploy contexts:** Different values for production vs. branch deploys

Go to **Site settings** → **Environment variables** → **Deploy contexts** to configure.

## Need Help?

If you encounter issues:
1. Check Netlify build logs in the dashboard
2. Check browser console for runtime errors
3. Verify all environment variables are set correctly
4. Make sure your Shopify store is accessible and has products
