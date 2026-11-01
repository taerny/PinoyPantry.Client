import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { ApiProductService } from '../services/apiProductService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Product } from '../types';

// Reverse of the nav-menu slugs, so the breadcrumb can link back to the right category page.
const CATEGORY_TO_SLUG: Record<string, string> = {
  'Canned Goods': 'canned-goods',
  'Snacks': 'snacks-chips',
  'Noodles': 'instant-noodles',
  'Condiments': 'condiments',
  'Beverages': 'beverages',
  'Soups & Mixes': 'soups-mixes',
  'Dairy': 'dairy',
  'Dried Fish': 'dried-fish',
  'Spreads': 'spreads',
};

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useDocumentTitle(product?.name ?? 'Product');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setRelated([]);
    setQuantity(1);

    ApiProductService.getProductById(id ?? '')
      .then(async p => {
        if (cancelled) return;
        if (!p) { setNotFound(true); return; }
        setProduct(p);

        // "You might also like": same category first (in stock only, never this product itself),
        // topped up with the newest products from elsewhere if the category is small.
        try {
          const sameCategory = p.category
            ? (await ApiProductService.getProducts({ category: p.category }, 1, 24)).products
            : [];
          const picks = sameCategory.filter(x => x.id !== p.id && x.inStock);
          if (picks.length < 8) {
            const newest = (await ApiProductService.getProducts(undefined, 1, 24, { sort: 'newest' })).products;
            for (const x of newest) {
              if (picks.length >= 8) break;
              if (x.id !== p.id && x.inStock && !picks.some(y => y.id === x.id)) picks.push(x);
            }
          }
          if (!cancelled) setRelated(picks.slice(0, 8));
        } catch {
          /* related products are a nicety - the page works without them */
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // Back goes to wherever the customer came from (the exact search/category view they were on,
  // via browser history). Opened directly (e.g. a shared link) there is no history to go back
  // to, so fall back to the product's category instead of leaving the site.
  const canGoBack = location.key !== 'default';
  const categorySlug = product?.category ? CATEGORY_TO_SLUG[product.category] : undefined;
  const fallbackPath = categorySlug ? `/category/${categorySlug}` : '/category/all-products';
  function goBack() {
    if (canGoBack) navigate(-1);
    else navigate(fallbackPath);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#3E2723] mb-2">Product not found</h1>
        <p className="text-gray-500 mb-6">This product is no longer available.</p>
        <Link to="/category/all-products" className="inline-block px-6 py-3 bg-[#3E2723] text-white rounded-full hover:bg-[#4A332E] transition-colors">
          Browse all products
        </Link>
      </div>
    );
  }

  const soldOut = !product.inStock;
  const inventory = product.inventory ?? 0;
  const lowStock = !soldOut && inventory <= 10;

  function handleAdd() {
    if (!product || soldOut) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Back + breadcrumb */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3E2723] hover:text-[#D32F2F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#D32F2F]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <Link to={fallbackPath} className="hover:text-[#D32F2F]">{product.category}</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-gray-700 line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-white border border-gray-100 rounded-xl overflow-hidden">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-contain p-4 ${soldOut ? 'grayscale opacity-60' : ''}`}
          />
          {product.badge && !soldOut && (
            <span className="absolute top-3 left-3 bg-[#F9A825] text-[#3E2723] px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow">
              {product.badge}
            </span>
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="bg-black text-white font-bold tracking-wide px-4 py-1.5 rounded-md text-sm uppercase shadow-lg">Sold Out</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <p className="text-xs font-semibold text-[#D32F2F] uppercase tracking-wide mb-2">{product.category}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-[#3E2723] mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-[#D32F2F] mb-1">${product.price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mb-4">Prices include GST</p>

          <p className={`text-sm font-medium mb-5 ${soldOut ? 'text-gray-500' : lowStock ? 'text-[#D32F2F]' : 'text-green-700'}`}>
            {soldOut ? 'Currently sold out' : lowStock ? `Only ${inventory} left` : 'In stock'}
          </p>

          {product.shortDescription && (
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.shortDescription}</p>
          )}

          {!soldOut && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2.5 hover:bg-gray-50 disabled:opacity-40"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                ><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(inventory || 99, q + 1))}
                  className="px-3 py-2.5 hover:bg-gray-50 disabled:opacity-40"
                  disabled={quantity >= (inventory || 99)}
                  aria-label="Increase quantity"
                ><Plus className="w-4 h-4" /></button>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-colors ${added ? 'bg-green-600' : 'bg-[#3E2723] hover:bg-[#4A332E]'}`}
              >
                <ShoppingCart className="w-4 h-4" /> {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          )}
          {soldOut && (
            <button disabled className="w-full py-3 rounded-lg bg-gray-200 text-gray-400 font-semibold cursor-not-allowed">Sold Out</button>
          )}
        </div>
      </div>

      {/* You might also like */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl md:text-2xl font-bold text-[#3E2723] mb-5">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {related.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                image={p.image}
                badge={p.badge}
                rating={p.rating}
                inventory={p.inventory}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
