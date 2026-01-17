# Shopify Product Import Guide

## Overview

This guide will help you replace your existing Shopify products with authentic Filipino pantry products.

**What's included in `shopify-products-import.csv`:**
- **60 authentic Filipino products** across 8 categories
- Rice & Grains (3 products)
- Canned Goods (4 products)
- Cooking Ingredients (9 products)
- Sauces & Condiments (11 products)
- Instant Noodles (6 products)
- Snacks & Sweets (16 products)
- Beverages (11 products)

All products include:
- Realistic pricing
- Detailed descriptions
- SKU codes
- Inventory quantities
- Product tags
- Vendor information
- Weight and shipping info

---

## Step 1: Delete Existing Products

### Option A: Delete All Products at Once (Recommended)

1. **Go to Shopify Admin**
   - Navigate to: `Products` → `All products`

2. **Select All Products**
   - Check the box at the top of the product list to select all products
   - If you have more than one page, you'll need to repeat this for each page

3. **Delete in Bulk**
   - Click the `Actions` dropdown
   - Select `Delete products`
   - Confirm the deletion

### Option B: Use Shopify Bulk Editor

1. **Open Bulk Editor**
   - Go to: `Products` → Click the checkbox to select all
   - Click `Bulk edit`

2. **Delete Products**
   - In the bulk editor, you can select all and delete

---

## Step 2: Import New Products

### Method 1: Using Shopify Admin (Recommended)

1. **Navigate to Import**
   ```
   Shopify Admin → Products → Import
   ```

2. **Upload CSV File**
   - Click `Add file` or drag and drop
   - Select: `shopify-products-import.csv`
   - Click `Upload and continue`

3. **Map Columns (if needed)**
   - Shopify should automatically recognize the standard column names
   - Review the mapping to ensure everything is correct
   - Click `Import products`

4. **Wait for Import**
   - The import will process in the background
   - You'll receive a notification when complete
   - Check your email for the import report

5. **Review Products**
   - Go to `Products` → `All products`
   - Verify that all 60 products were imported successfully

### Method 2: Using Shopify CLI (Alternative)

If you prefer using the command line:

```bash
# Make sure you're logged in
shopify auth login

# Import products (if supported by your app)
# Note: Product import via CLI may require additional setup
```

---

## Step 3: Add Product Images

**Important:** The CSV file doesn't include actual image URLs. You'll need to add product images.

### Quick Image Solution:

1. **Use Stock Photos**
   - Search for product images on:
     - Unsplash (free)
     - Pexels (free)
     - Your actual product photos

2. **Bulk Add Images**
   - Go to each product
   - Click `Add media`
   - Upload product images
   - Set the first image as the featured image

### Recommended Image Sizes:
- **Minimum:** 800x800px
- **Recommended:** 2048x2048px
- **Format:** JPG or PNG
- **Aspect Ratio:** 1:1 (square)

---

## Step 4: Organize Collections (Categories)

After importing products, create collections to organize them:

1. **Create Collections**
   ```
   Shopify Admin → Products → Collections → Create collection
   ```

2. **Collection Names:**
   - Rice & Grains
   - Canned Goods
   - Sauces & Condiments
   - Instant Noodles
   - Snacks & Sweets
   - Beverages
   - Cooking Ingredients

3. **Add Products to Collections**
   - **Option A: Manual Selection**
     - Edit each collection
     - Click `Add products`
     - Select products manually

   - **Option B: Automated Conditions** (Recommended)
     - Edit collection
     - Choose `Automated`
     - Set condition: `Product tag` → `is equal to` → `rice` (for Rice collection)
     - This will automatically add products based on tags in the CSV

4. **Set Collection Handles**
   - Make sure collection handles match your app's category slugs:
     - `rice-grains`
     - `canned-goods`
     - `sauces-condiments`
     - `instant-noodles`
     - `snacks-sweets`
     - `beverages`
     - `cooking-ingredients`

---

## Step 5: Verify Integration

1. **Check Your React App**
   - Open: http://localhost:3000/
   - The homepage should now display your Filipino products
   - Browse different categories
   - Check product details

2. **Test Functionality**
   - ✅ Products load from Shopify
   - ✅ Collections display as categories
   - ✅ Product details show correctly
   - ✅ Add to cart works
   - ✅ Inventory tracking works

3. **If Products Don't Show:**
   - Check your `.env` file:
     ```
     VITE_USE_MOCK_DATA=false
     ```
   - Restart your dev server:
     ```bash
     npm run dev
     ```
   - Check browser console for errors

---

## Step 6: Adjust Pricing & Inventory (Optional)

After import, you may want to adjust:

1. **Pricing**
   - Use Shopify Bulk Editor to adjust prices
   - Set sale prices if needed
   - Add price tiers

2. **Inventory**
   - Adjust inventory quantities based on your actual stock
   - Set "Continue selling when out of stock" policy
   - Enable inventory tracking

3. **Product Variants**
   - Add size variants (if applicable)
   - Add quantity variants (e.g., 1kg, 2kg, 5kg)

---

## Troubleshooting

### Import Fails or Shows Errors

1. **Check CSV Format**
   - Open in Excel/Google Sheets
   - Ensure no special characters are breaking the format
   - Save as CSV UTF-8

2. **Column Mismatch**
   - Shopify expects specific column names
   - The provided CSV uses standard Shopify format
   - Refer to: [Shopify CSV Import Documentation](https://help.shopify.com/en/manual/products/import-export/using-csv)

### Products Show But No Images

- Images need to be uploaded separately
- Use the bulk editor to add images quickly
- Or add image URLs to the `Image Src` column in CSV

### Collections Not Showing

- Make sure collections are created
- Check collection handles match your app's category slugs
- Ensure products are assigned to collections

### App Shows Mock Data Instead of Shopify

1. Check `.env` file:
   ```
   VITE_USE_MOCK_DATA=false
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Clear browser cache and reload

---

## Product Categories Breakdown

### Rice & Grains (3 products)
- Jasmine Rice 5kg - $12.99
- Sinandomeng Rice 10kg - $24.99
- Malagkit Glutinous Rice 2kg - $8.99

### Canned Goods (4 products)
- SPAM Classic 340g - $4.99
- Argentina Corned Beef 175g - $3.49
- Century Tuna Flakes 180g - $2.99
- Ligo Sardines 155g - $1.99

### Sauces & Condiments (11 products)
- UFC Banana Ketchup - $2.99
- Datu Puti Soy Sauce - $3.99
- Datu Puti Vinegar - $2.99
- Mang Tomas Sauce - $3.49
- And more...

### Instant Noodles (6 products)
- Lucky Me Pancit Canton (Original, Chilimansi, Calamansi) - $0.79
- Lucky Me Instant Mami (Beef, Chicken) - $0.69
- Nissin Cup Noodles - $1.49

### Snacks & Sweets (16 products)
- Boy Bawang Cornick - $2.49
- Chippy, Piattos, Nova - $1.99-$2.49
- SkyFlakes, Fita Crackers - $2.99-$3.29
- Cream-O, Hansel - $2.99-$3.49
- And more...

### Beverages (11 products)
- Calamansi Concentrate - $4.99
- Zest-O Juices - $1.29-$2.99
- C2 Green Tea - $1.79
- Nescafe, Great Taste Coffee - $7.99
- Milo, Ovaltine - $8.49-$8.99

### Cooking Ingredients (9 products)
- Coconut Milk, Coconut Cream - $2.49-$2.99
- Mama Sita's Mixes (Adobo, Sinigang) - $1.99
- Magic Sarap, Ajinomoto - $1.99-$2.99
- Fish Sauce, Bagoong - $3.99-$4.49

---

## Next Steps

After successful import:

1. ✅ Add product images
2. ✅ Create and organize collections
3. ✅ Set up product variants (if needed)
4. ✅ Configure shipping rates
5. ✅ Test checkout flow
6. ✅ Set up payment gateway
7. ✅ Launch your store!

---

## Additional Resources

- [Shopify Product CSV Documentation](https://help.shopify.com/en/manual/products/import-export/using-csv)
- [Shopify Collections Guide](https://help.shopify.com/en/manual/products/collections)
- [Shopify Bulk Editor](https://help.shopify.com/en/manual/productivity-tools/bulk-editing-products)

---

**Your Filipino pantry store is ready to go!** 🎉🇵🇭
