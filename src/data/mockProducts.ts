import { Product, Category } from '../types';

/**
 * Mock Product Data
 * This data will be replaced with Shopify API calls later
 */

export const mockCategories: Category[] = [
  { 
    id: 'all-products',
    title: 'All Products', 
    slug: 'all-products',
    icon: '🛒', 
    itemCount: 120,
    description: 'Browse our complete collection of authentic Filipino foods'
  },
  { 
    id: 'canned-goods',
    title: 'Canned Goods', 
    slug: 'canned-goods',
    icon: '🥫', 
    itemCount: 120,
    description: 'Premium quality canned goods from the Philippines'
  },
  { 
    id: 'snacks-chips',
    title: 'Snacks & Chips', 
    slug: 'snacks-chips',
    icon: '🍟', 
    itemCount: 85,
    description: 'Crispy and delicious Filipino snacks and chips'
  },
  { 
    id: 'instant-noodles',
    title: 'Instant Noodles', 
    slug: 'instant-noodles',
    icon: '🍜', 
    itemCount: 65,
    description: 'Quick and tasty Filipino instant noodles'
  },
  { 
    id: 'beverages',
    title: 'Beverages', 
    slug: 'beverages',
    icon: '🥤', 
    itemCount: 45,
    description: 'Refreshing Filipino drinks and beverages'
  },
  { 
    id: 'condiments',
    title: 'Condiments', 
    slug: 'condiments',
    icon: '🧂', 
    itemCount: 55,
    description: 'Essential Filipino condiments and sauces'
  },
  { 
    id: 'sweets',
    title: 'Sweets', 
    slug: 'sweets',
    icon: '🍬', 
    itemCount: 40,
    description: 'Delicious Filipino candies and sweet treats'
  },
];

export const mockProducts: Product[] = [
  // Canned Goods
  {
    id: 'premium-corned-beef',
    name: 'Premium Corned Beef',
    price: 89.99,
    originalPrice: 120.00,
    image: 'https://images.unsplash.com/photo-1733700469173-15d46efc2c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuZWQlMjBiZWVmJTIwY2FufGVufDF8fHx8MTc2NDI0MTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'BESTSELLER',
    rating: 4.8,
    category: 'canned-goods',
    inStock: true,
    description: 'Premium quality corned beef 150g',
  },
  {
    id: 'corned-beef-original-175g',
    name: 'Corned Beef Original 175g',
    price: 95.00,
    image: 'https://images.unsplash.com/photo-1733700469173-15d46efc2c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuZWQlMjBiZWVmJTIwY2FufGVufDF8fHx8MTc2NDI0MTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'canned-goods',
    inStock: true,
  },
  {
    id: 'canned-sardines-tomato',
    name: 'Canned Sardines in Tomato Sauce',
    price: 32.50,
    originalPrice: 40.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'canned-goods',
    inStock: true,
  },
  {
    id: 'sardines-green-chili',
    name: 'Sardines Green Chili 155g',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.5,
    category: 'canned-goods',
    inStock: true,
  },
  {
    id: 'coconut-milk-premium',
    name: 'Coconut Milk Premium Quality',
    price: 55.00,
    originalPrice: 65.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'canned-goods',
    inStock: true,
    description: 'Premium coconut milk 400ml',
  },
  {
    id: 'coconut-cream-165ml',
    name: 'Coconut Cream 165ml',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.6,
    category: 'canned-goods',
    inStock: true,
  },
  
  // Snacks & Chips
  {
    id: 'chippy-chips-assorted',
    name: 'Chippy Chips Assorted Pack',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'BESTSELLER',
    rating: 4.5,
    category: 'snacks-chips',
    inStock: true,
  },
  {
    id: 'banana-chips',
    name: 'Crispy Banana Chips 100g',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'snacks-chips',
    inStock: true,
  },
  {
    id: 'cheese-rings-party',
    name: 'Cheese Rings Party Size',
    price: 55.00,
    originalPrice: 65.00,
    image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'snacks-chips',
    inStock: true,
  },
  {
    id: 'shrimp-crackers',
    name: 'Shrimp Crackers 200g',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.8,
    category: 'snacks-chips',
    inStock: true,
  },
  {
    id: 'sweet-corn-snack',
    name: 'Sweet Corn Snack Mix',
    price: 40.00,
    image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.4,
    category: 'snacks-chips',
    inStock: true,
  },
  {
    id: 'garlic-peanuts',
    name: 'Spicy Garlic Peanuts 150g',
    price: 38.00,
    originalPrice: 45.00,
    image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.5,
    category: 'snacks-chips',
    inStock: true,
  },
  
  // Instant Noodles
  {
    id: 'pancit-canton-10pack',
    name: 'Instant Pancit Canton - 10 Pack',
    price: 99.00,
    image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.9,
    category: 'instant-noodles',
    inStock: true,
  },
  {
    id: 'pancit-canton-chili-mansi',
    name: 'Pancit Canton Chili-Mansi 60g',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    category: 'instant-noodles',
    inStock: true,
  },
  {
    id: 'pancit-canton-original',
    name: 'Pancit Canton Original Flavor',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'instant-noodles',
    inStock: true,
  },
  {
    id: 'instant-mami-chicken',
    name: 'Instant Mami Chicken 55g',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'instant-noodles',
    inStock: true,
  },
  {
    id: 'instant-batchoy-bowl',
    name: 'Instant Batchoy Bowl 60g',
    price: 15.00,
    originalPrice: 18.00,
    image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.8,
    category: 'instant-noodles',
    inStock: true,
  },
  {
    id: 'spicy-beef-noodles',
    name: 'Spicy Beef Noodles 65g',
    price: 13.00,
    image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.5,
    category: 'instant-noodles',
    inStock: true,
  },
  
  // Beverages
  {
    id: 'calamansi-juice',
    name: 'Calamansi Juice Concentrate 500ml',
    price: 75.00,
    originalPrice: 85.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'BESTSELLER',
    rating: 4.7,
    category: 'beverages',
    inStock: true,
  },
  {
    id: 'coconut-water-6pack',
    name: 'Coconut Water 330ml - 6 Pack',
    price: 180.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'beverages',
    inStock: true,
  },
  {
    id: 'mango-juice-1l',
    name: 'Mango Juice Drink 1L',
    price: 95.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.5,
    category: 'beverages',
    inStock: true,
  },
  {
    id: 'instant-coffee-3in1',
    name: 'Instant Coffee 3-in-1 Box',
    price: 120.00,
    originalPrice: 140.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    category: 'beverages',
    inStock: true,
  },
  {
    id: 'pineapple-juice',
    name: 'Pineapple Juice 1L',
    price: 90.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.6,
    category: 'beverages',
    inStock: true,
  },
  {
    id: 'sagot-gulaman-mix',
    name: 'Sago\'t Gulaman Mix 500g',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'beverages',
    inStock: true,
  },
  
  // Condiments
  {
    id: 'banana-ketchup',
    name: 'Banana Ketchup 320g',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'BESTSELLER',
    rating: 4.8,
    category: 'condiments',
    inStock: true,
  },
  {
    id: 'soy-sauce-premium',
    name: 'Soy Sauce Premium 500ml',
    price: 55.00,
    originalPrice: 65.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'condiments',
    inStock: true,
  },
  {
    id: 'vinegar-spiced',
    name: 'Vinegar Spiced 385ml',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'condiments',
    inStock: true,
  },
  {
    id: 'fish-sauce',
    name: 'Fish Sauce 750ml',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.5,
    category: 'condiments',
    inStock: true,
  },
  {
    id: 'shrimp-paste-bagoong',
    name: 'Shrimp Paste (Bagoong) 250g',
    price: 50.00,
    originalPrice: 60.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.7,
    category: 'condiments',
    inStock: true,
  },
  {
    id: 'lechon-sauce',
    name: 'Lechon Sauce 330g',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    category: 'condiments',
    inStock: true,
  },
  
  // Sweets
  {
    id: 'assorted-filipino-sweets',
    name: 'Assorted Filipino Sweets Mix',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'BESTSELLER',
    rating: 4.4,
    category: 'sweets',
    inStock: true,
  },
  {
    id: 'white-rabbit-candy',
    name: 'White Rabbit Candy 180g',
    price: 95.00,
    originalPrice: 110.00,
    image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'sweets',
    inStock: true,
  },
  {
    id: 'polvoron-assorted',
    name: 'Polvoron Assorted Pack 250g',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    category: 'sweets',
    inStock: true,
  },
  {
    id: 'yema-candy',
    name: 'Yema Candy Box 200g',
    price: 75.00,
    image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    badge: 'NEW',
    rating: 4.5,
    category: 'sweets',
    inStock: true,
  },
  {
    id: 'pastillas-de-leche',
    name: 'Pastillas de Leche 150g',
    price: 65.00,
    originalPrice: 75.00,
    image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    category: 'sweets',
    inStock: true,
  },
  {
    id: 'barquillos-wafer-rolls',
    name: 'Barquillos (Wafer Rolls) 200g',
    price: 70.00,
    image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    category: 'sweets',
    inStock: true,
  },
];

// Helper function to get featured products (first 6 products)
export const getFeaturedProducts = (): Product[] => {
  return [
    mockProducts[0],  // Premium Corned Beef
    mockProducts[6],  // Chippy Chips
    mockProducts[2],  // Sardines in Tomato
    mockProducts[12], // Pancit Canton 10 pack
    mockProducts[4],  // Coconut Milk
    mockProducts[24], // Assorted Sweets
  ];
};

// Helper function to get products by category
export const getProductsByCategory = (categorySlug: string): Product[] => {
  if (categorySlug === 'all-products') {
    return mockProducts;
  }
  return mockProducts.filter(product => product.category === categorySlug);
};

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return mockCategories.find(cat => cat.slug === slug);
};
