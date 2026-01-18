# Project Context - PinoyPantry E-commerce

**Last Updated:** January 19, 2025  
**Purpose:** Context summary for continuing development on different PCs

---

## 📋 Project Overview

Building an e-commerce platform with:
- **Frontend:** React (PinoyPantry.Client)
- **Backend:** Laravel API (PinoyPantry.API) - In progress
- **E-commerce Platform:** Shopify (pinoy-pantry-2.myshopify.com)

---

## 🎯 Current Status

### ✅ Completed Today

1. **Laravel Project Created**
   - Location: `e:\my-websites\PinoyPantry.API`
   - Version: Laravel 12.47.0
   - Database: SQLite (for development)
   - Repository: `https://github.com/taerny/PinoyPantry.API.git`

2. **Shopify Customer Accounts Setup**
   - Store: `pinoy-pantry-2.myshopify.com`
   - Customer Accounts: **Legacy mode** (email/password)
   - Password Protection: ON (for development - needs plan to disable)

3. **React Login Integration**
   - Created: `src/services/shopifyCustomerService.ts`
   - Updated: `src/pages/LoginPage.tsx`
   - **Current Behavior:** Redirects to Shopify's hosted login pages
   - **Problem:** Customer fills form twice (React form → Shopify form)
   - **Deployed:** Live on Netlify (`pinoypantryclient2.netlify.app`)

4. **Code Pushed to GitHub**
   - React App: All changes committed and pushed
   - Laravel API: Initial setup committed and pushed

---

## ⚠️ Current Issue

**Problem:** Login/Registration shows duplicate forms
- Customer fills YOUR React form
- Gets redirected to Shopify form
- Has to fill form again ❌ Bad UX

**Solution Needed:** Laravel backend proxy
- Customer fills YOUR React form only
- React → Laravel → Shopify API
- Customer never sees Shopify pages ✅

---

## 🔄 Next Steps

1. **Set up Shopify API in Laravel**
   - Install Shopify PHP SDK or use HTTP client
   - Configure Shopify credentials in Laravel `.env`

2. **Create Laravel API Endpoints**
   - `POST /api/customer/register` - Customer registration
   - `POST /api/customer/login` - Customer login
   - `GET /api/customer/orders` - Order history (future)

3. **Update React App**
   - Change `shopifyCustomerService.ts` to call Laravel instead of Shopify
   - Remove redirects, use API calls
   - Customer stays on your site ✅

---

## 📁 Project Structure

```
e:\my-websites\
├── PinoyPantry.Client\          # React Frontend
│   ├── src\
│   │   ├── pages\
│   │   │   └── LoginPage.tsx    # Login/Registration forms
│   │   └── services\
│   │       └── shopifyCustomerService.ts  # Currently redirects to Shopify
│   └── GitHub: https://github.com/taerny/PinoyPantry.Client.git
│
├── PinoyPantry.API\              # Laravel Backend (NEW)
│   ├── app\
│   ├── routes\
│   └── GitHub: https://github.com/taerny/PinoyPantry.API.git
│
└── PROJECT_CONTEXT.md           # This file
```

---

## 🔑 Key Configuration

### React App (.env)
```
VITE_SHOPIFY_STORE_DOMAIN=pinoy-pantry-2.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=(your token)
VITE_SHOPIFY_API_VERSION=2025-07
```

### Laravel App (.env)
```
APP_NAME="PinoyPantry API"
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
```

### Shopify Store
- **Store Domain:** `pinoy-pantry-2.myshopify.com`
- **Customer Accounts:** Legacy (email/password)
- **Storefront API:** Already configured
- **Customer Account API:** Will need to be configured for Laravel

---

## 📚 Reference Guides

All guides are in the repository:

1. **`LARAVEL_API_SETUP_GUIDE.md`** (root folder)
   - Complete Laravel setup tutorial
   - Step-by-step instructions
   - Code examples

2. **`LARAVEL_QUICK_START.md`** (root folder)
   - Quick command checklist
   - Fast reference

3. **`SHOPIFY_INTEGRATION.md`** (PinoyPantry.Client folder)
   - Shopify integration guide

---

## 💰 Cost Information

### Current Costs
- **Shopify Basic Plan:** $29/month (password protected for now)
- **Laravel Hosting:** Not yet set up (will need ~$6-12/month on DigitalOcean)

### Data Storage
- **Customer Data:** Stored in Shopify (unlimited)
- **Order Data:** Stored in Shopify (unlimited)
- **Laravel Database:** Only for app logic (not customer data)

---

## 🐛 Known Issues

1. **Password Protection ON**
   - Shopify store requires password to access
   - Must enter password before testing login
   - Will need to select plan to disable (or keep for dev)

2. **Duplicate Forms**
   - React form → Shopify form (current)
   - Need Laravel to fix this

---

## 🎯 Goal

**End Goal:** Seamless customer experience
- Customer fills YOUR React form
- Stays on YOUR website
- Never sees Shopify pages
- All handled by Laravel backend

---

## 💡 Quick Start (For New PC)

1. **Clone repositories:**
   ```bash
   git clone https://github.com/taerny/PinoyPantry.Client.git
   git clone https://github.com/taerny/PinoyPantry.API.git
   ```

2. **Open in Cursor/VS Code**

3. **Start new chat with context:**
   - "Continuing PinoyPantry project - need to set up Laravel to proxy Shopify Customer Account API"
   - Reference this file and the guides

4. **Continue from where we left off:**
   - Set up Shopify API in Laravel
   - Create login/registration endpoints
   - Update React to call Laravel

---

## 📝 Notes

- Laravel is just a **proxy/middleman** - doesn't store customer data
- Customer data stays in Shopify's database
- Laravel handles API calls (solves CORS issue)
- React forms stay on your site (better UX)

---

**Ready to continue?** Next step is setting up Shopify Customer Account API integration in Laravel! 🚀
