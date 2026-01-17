# Collections Setup Guide

## ✅ CSV Updated!

Your CSV file now includes **collection tags** for automatic categorization:
- `rice-grains`
- `canned-goods`
- `sauces-condiments`
- `instant-noodles`
- `snacks-sweets`
- `beverages`
- `cooking-ingredients`

These tags match your React app's category slugs perfectly!

---

## 📋 Step-by-Step: Create Automated Collections

After importing your products, create collections that automatically populate:

### 1. Go to Collections Page
```
Shopify Admin → Products → Collections → Create collection
```

### 2. Create Each Collection (7 total)

For each collection, follow this pattern:

---

#### Collection 1: Rice & Grains

1. **Collection details:**
   - Title: `Rice & Grains`
   - Description: `Premium quality rice and grains for everyday meals`

2. **Collection type:** 
   - Select **Automated**

3. **Conditions:**
   - Product tag `is equal to` `rice-grains`

4. **Search engine listing:**
   - URL handle: `rice-grains` (automatically set)

5. Click **Save**

---

#### Collection 2: Canned Goods

1. **Collection details:**
   - Title: `Canned Goods`
   - Description: `Quality canned meats and seafood`

2. **Collection type:** Automated

3. **Conditions:**
   - Product tag `is equal to` `canned-goods`

4. **URL handle:** `canned-goods`

5. Click **Save**

---

#### Collection 3: Sauces & Condiments

1. **Collection details:**
   - Title: `Sauces & Condiments`
   - Description: `Authentic Filipino sauces and condiments`

2. **Collection type:** Automated

3. **Conditions:**
   - Product tag `is equal to` `sauces-condiments`

4. **URL handle:** `sauces-condiments`

5. Click **Save**

---

#### Collection 4: Instant Noodles

1. **Collection details:**
   - Title: `Instant Noodles`
   - Description: `Quick and delicious instant noodles`

2. **Collection type:** Automated

3. **Conditions:**
   - Product tag `is equal to` `instant-noodles`

4. **URL handle:** `instant-noodles`

5. Click **Save**

---

#### Collection 5: Snacks & Sweets

1. **Collection details:**
   - Title: `Snacks & Sweets`
   - Description: `Filipino favorite snacks and treats`

2. **Collection type:** Automated

3. **Conditions:**
   - Product tag `is equal to` `snacks-sweets`

4. **URL handle:** `snacks-sweets`

5. Click **Save**

---

#### Collection 6: Beverages

1. **Collection details:**
   - Title: `Beverages`
   - Description: `Refreshing drinks and coffee mixes`

2. **Collection type:** Automated

3. **Conditions:**
   - Product tag `is equal to` `beverages`

4. **URL handle:** `beverages`

5. Click **Save**

---

#### Collection 7: Cooking Ingredients

1. **Collection details:**
   - Title: `Cooking Ingredients`
   - Description: `Essential ingredients for Filipino cooking`

2. **Collection type:** Automated

3. **Conditions:**
   - Product tag `is equal to` `cooking-ingredients`

4. **URL handle:** `cooking-ingredients`

5. Click **Save**

---

## 🎯 Why Automated Collections?

**Benefits:**
- ✅ Products automatically appear in the right category
- ✅ No manual assignment needed
- ✅ New products with matching tags auto-populate
- ✅ URL handles match your React app's routing

---

## 🔍 Quick Verification

After creating all 7 collections:

1. Go to: `Products → Collections`
2. You should see all 7 collections with product counts:
   - Rice & Grains (3 products)
   - Canned Goods (4 products)
   - Sauces & Condiments (11 products)
   - Instant Noodles (6 products)
   - Snacks & Sweets (16 products)
   - Beverages (11 products)
   - Cooking Ingredients (9 products)

3. Click each collection to verify products are listed

---

## 🚀 Your React App Integration

Your React app will automatically work because:

1. **Collection handles match category slugs:**
   - App uses: `rice-grains`
   - Shopify collection: `rice-grains` ✅

2. **Shopify GraphQL query:**
   - Your `ShopifyProductService` fetches by collection handle
   - Perfect match with your existing code!

3. **No code changes needed!**
   - Just create the collections
   - Everything will work automatically

---

## 📊 Expected Results in Your App

After setup, when you navigate to:

- `/category/rice-grains` → Shows 3 rice products
- `/category/canned-goods` → Shows 4 canned products
- `/category/snacks-sweets` → Shows 16 snack products
- And so on...

---

## ⏱️ Time Estimate

- Creating all 7 collections: **5-7 minutes**
- Very simple and repetitive process!

---

**Ready to import and set up collections?** 🎉
