import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductsGridSkeleton, Skeleton } from '../components/Skeleton';
import { Filter } from 'lucide-react';
import { useProductsByCategory } from '../hooks/useProducts';
import { useCategory } from '../hooks/useCategories';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  
  const categorySlug = slug || 'all-products';
  
  // Fetch data using hooks
  const { products: rawProducts, loading: productsLoading } = useProductsByCategory(categorySlug);
  const { category: categoryData, loading: categoryLoading } = useCategory(categorySlug);

  // Sort products based on selected option
  const products = [...rawProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'featured':
      default:
        return 0;
    }
  });

  // Show loading state with skeleton
  if (productsLoading || categoryLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Filter Bar Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <ProductsGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Fallback data if category not found
  const displayData = categoryData || {
    title: categorySlug,
    description: 'Browse our products',
  };

  // Old hardcoded data structure (keeping as reference, will be removed)
  const oldCategoryData: Record<string, any> = {
    'All Products': {
      title: 'All Products',
      description: 'Browse our complete collection of authentic Filipino foods',
      products: [
        {
          name: 'Premium Corned Beef',
          price: 89.99,
          originalPrice: 120.00,
          image: 'https://images.unsplash.com/photo-1733700469173-15d46efc2c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuZWQlMjBiZWVmJTIwY2FufGVufDF8fHx8MTc2NDI0MTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.8,
        },
        {
          name: 'Chippy Chips Assorted Pack',
          price: 45.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.5,
        },
        {
          name: 'Canned Sardines in Tomato Sauce',
          price: 32.50,
          originalPrice: 40.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Instant Pancit Canton - 10 Pack',
          price: 99.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.9,
        },
        {
          name: 'Coconut Milk Premium Quality',
          price: 55.00,
          originalPrice: 65.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Assorted Filipino Sweets Mix',
          price: 120.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.4,
        },
      ],
    },
    'Canned Goods': {
      title: 'Canned Goods',
      description: 'Premium quality canned goods from the Philippines',
      products: [
        {
          name: 'Premium Corned Beef 150g',
          price: 89.99,
          originalPrice: 120.00,
          image: 'https://images.unsplash.com/photo-1733700469173-15d46efc2c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuZWQlMjBiZWVmJTIwY2FufGVufDF8fHx8MTc2NDI0MTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.8,
        },
        {
          name: 'Corned Beef Original 175g',
          price: 95.00,
          image: 'https://images.unsplash.com/photo-1733700469173-15d46efc2c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuZWQlMjBiZWVmJTIwY2FufGVufDF8fHx8MTc2NDI0MTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Canned Sardines in Tomato Sauce',
          price: 32.50,
          originalPrice: 40.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Sardines Green Chili 155g',
          price: 35.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.5,
        },
        {
          name: 'Coconut Milk Premium 400ml',
          price: 55.00,
          originalPrice: 65.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Coconut Cream 165ml',
          price: 45.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.6,
        },
      ],
    },
    'Snacks & Chips': {
      title: 'Snacks & Chips',
      description: 'Crispy and delicious Filipino snacks and chips',
      products: [
        {
          name: 'Chippy Chips Assorted Pack',
          price: 45.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.5,
        },
        {
          name: 'Crispy Banana Chips 100g',
          price: 35.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Cheese Rings Party Size',
          price: 55.00,
          originalPrice: 65.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Shrimp Crackers 200g',
          price: 60.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.8,
        },
        {
          name: 'Sweet Corn Snack Mix',
          price: 40.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.4,
        },
        {
          name: 'Spicy Garlic Peanuts 150g',
          price: 38.00,
          originalPrice: 45.00,
          image: 'https://images.unsplash.com/photo-1748765968997-ba9bae9cfd7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNuYWNrcyUyMGNoaXBzfGVufDF8fHx8MTc2NDI0MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.5,
        },
      ],
    },
    'Instant Noodles': {
      title: 'Instant Noodles',
      description: 'Quick and tasty Filipino instant noodles',
      products: [
        {
          name: 'Instant Pancit Canton - 10 Pack',
          price: 99.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.9,
        },
        {
          name: 'Pancit Canton Chili-Mansi 60g',
          price: 12.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.8,
        },
        {
          name: 'Pancit Canton Original Flavor',
          price: 12.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Instant Mami Chicken 55g',
          price: 10.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Instant Batchoy Bowl 60g',
          price: 15.00,
          originalPrice: 18.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.8,
        },
        {
          name: 'Spicy Beef Noodles 65g',
          price: 13.00,
          image: 'https://images.unsplash.com/photo-1684707878393-02606f779d7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YW50JTIwbm9vZGxlc3xlbnwxfHx8fDE3NjQyMTg2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.5,
        },
      ],
    },
    'Beverages': {
      title: 'Beverages',
      description: 'Refreshing Filipino drinks and beverages',
      products: [
        {
          name: 'Calamansi Juice Concentrate 500ml',
          price: 75.00,
          originalPrice: 85.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.7,
        },
        {
          name: 'Coconut Water 330ml - 6 Pack',
          price: 180.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Mango Juice Drink 1L',
          price: 95.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.5,
        },
        {
          name: 'Instant Coffee 3-in-1 Box',
          price: 120.00,
          originalPrice: 140.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.8,
        },
        {
          name: 'Pineapple Juice 1L',
          price: 90.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.6,
        },
        {
          name: 'Sago\'t Gulaman Mix 500g',
          price: 85.00,
          image: 'https://images.unsplash.com/photo-1587890767851-e9bc526764b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbWlsayUyMGNhbnxlbnwxfHx8fDE3NjQyNDEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
      ],
    },
    'Condiments': {
      title: 'Condiments',
      description: 'Essential Filipino condiments and sauces',
      products: [
        {
          name: 'Banana Ketchup 320g',
          price: 45.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.8,
        },
        {
          name: 'Soy Sauce Premium 500ml',
          price: 55.00,
          originalPrice: 65.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Vinegar Spiced 385ml',
          price: 35.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Fish Sauce 750ml',
          price: 60.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.5,
        },
        {
          name: 'Shrimp Paste (Bagoong) 250g',
          price: 50.00,
          originalPrice: 60.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.7,
        },
        {
          name: 'Lechon Sauce 330g',
          price: 48.00,
          image: 'https://images.unsplash.com/photo-1612570964312-e0f339a84d6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzYXJkaW5lc3xlbnwxfHx8fDE3NjQyNDEzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.8,
        },
      ],
    },
    'Sweets': {
      title: 'Sweets',
      description: 'Delicious Filipino candies and sweet treats',
      products: [
        {
          name: 'Assorted Filipino Sweets Mix',
          price: 120.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'BESTSELLER',
          rating: 4.4,
        },
        {
          name: 'White Rabbit Candy 180g',
          price: 95.00,
          originalPrice: 110.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
        {
          name: 'Polvoron Assorted Pack 250g',
          price: 85.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.7,
        },
        {
          name: 'Yema Candy Box 200g',
          price: 75.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          badge: 'NEW',
          rating: 4.5,
        },
        {
          name: 'Pastillas de Leche 150g',
          price: 65.00,
          originalPrice: 75.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.8,
        },
        {
          name: 'Barquillos (Wafer Rolls) 200g',
          price: 70.00,
          image: 'https://images.unsplash.com/photo-1763697039063-f68a90a95909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNhbmR5JTIwc3dlZXRzfGVufDF8fHx8MTc2NDI0MTM4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          rating: 4.6,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">{displayData.title}</h1>
          <p className="text-muted-foreground">{displayData.description || 'Browse our products'}</p>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825] cursor-pointer transition-all hover:border-[#F9A825]"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                badge={product.badge}
                rating={product.rating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
