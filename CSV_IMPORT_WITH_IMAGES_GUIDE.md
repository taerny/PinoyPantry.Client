# Shopify CSV Import Guide - With Product Images

## ✅ **FIXED - Ready to Import!**

The CSV formatting error has been fixed. All fields are now properly quoted using PowerShell's `Export-Csv` command, which prevents newline errors.

## 📦 What's Included

Created: `shopify-products-with-images.csv`
**Total Products: 30 Filipino products with images**
**Format: Properly quoted CSV with automatic escaping**

---

## 🖼️ Image Sources

All product images are from **Unsplash** (free, high-quality, commercial use allowed):
- Food photography
- Relevant to each product category
- Optimized URLs (800px width, 80% quality)

### Categories with Images:

1. **Rice & Grains** (3 products)
   - Jasmine Rice, Sinandomeng Rice, Malagkit Rice
   - Images: Rice grains, bags of rice

2. **Canned Goods** (4 products)
   - SPAM, Corned Beef, Tuna, Sardines
   - Images: Canned foods, meat products

3. **Cooking Ingredients** (4 products)
   - Coconut milk/cream, Kare-kare mix, Sinigang mix
   - Images: Cooking ingredients, spices, sauces

4. **Sauces & Condiments** (7 products)
   - Banana ketchup, Soy sauce, Oyster sauce, Vinegar, Bagoong, Sweet chili
   - Images: Sauce bottles, condiments

5. **Instant Noodles** (3 products)
   - Pancit Canton (Original, Chilimansi), Cup Noodles
   - Images: Noodle packages, instant ramen

6. **Snacks & Sweets** (7 products)
   - Boy Bawang, Chippy, Piattos, Polvoron, Pastillas, Skyflakes, Nagaraya
   - Images: Snack foods, chips, cookies, sweets

7. **Beverages** (2 products)
   - C2 Green Tea, Milo
   - Images: Drinks, beverages

---

## 📋 CSV Format

The CSV includes these columns:
- Title
- URL handle
- Description
- Vendor
- Product category
- Type
- Tags
- Published status
- Status
- SKU
- **Image Src** ← URLs to product images

---

## 🚀 How to Import

### Step 1: Delete Old Products (Optional)
If you want to start fresh:
1. Go to **Shopify Admin** → **Products**
2. Select all products → **Delete products**

### Step 2: Import the CSV
1. Go to **Shopify Admin** → **Products**
2. Click **Import**
3. Choose file: `shopify-products-with-images.csv`
4. Click **Upload and continue**

### Step 3: Review Preview
- Check that 30 products are listed
- Verify images are showing in preview
- All fields should be properly formatted
- Click **Import products**

### Step 4: Wait for Import
- Import should complete in 1-2 minutes
- You'll receive a confirmation

---

## ✅ What Happens with Images

Shopify will:
1. Download each image from Unsplash
2. Store them in your Shopify media library
3. Attach them to the products
4. Display them on your storefront

**No manual image upload needed!** 🎉

---

## 🏷️ Collections Setup

After import, create these automated collections (from your previous `COLLECTIONS_SETUP.md`):

1. **Rice & Grains** - Tag contains `rice-grains`
2. **Canned Goods** - Tag contains `canned-goods`
3. **Cooking Ingredients** - Tag contains `cooking-ingredients`
4. **Sauces & Condiments** - Tag contains `sauces-condiments`
5. **Instant Noodles** - Tag contains `instant-noodles`
6. **Snacks & Sweets** - Tag contains `snacks-sweets`
7. **Beverages** - Tag contains `beverages`

---

## 🎯 Your Website Will Show

Once imported and collections created:
- ✅ All 30 products with images
- ✅ Properly categorized
- ✅ Searchable
- ✅ Sortable (price, name)
- ✅ Beautiful product photos

---

## 💡 Notes

- Images are placeholder/generic - you can replace with actual product photos later
- All images are copyright-free from Unsplash
- Image URLs work directly, no local files needed
- Products include realistic prices in NZD

---

## 🔄 Next Steps After Import

1. **Test your website** at `http://localhost:3001/`
2. **Browse categories** - should show products with images
3. **Try search** - type product names
4. **Test sorting** - price low/high, name A-Z
5. **Check cart** - add products, test checkout flow

---

**Ready to launch!** 🚀
