import { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, Image as ImageIcon, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export function AdminUploadPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchProducts();
    }
  }, [authLoading, user, isAdmin]);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API_URL}/api/products?limit=50`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(productId: number, file: File) {
    if (!user) return;
    setUploading(productId);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/image/upload?productId=${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }

      const data = await res.json();
      setMessage({ type: 'success', text: `Image uploaded for product #${productId}` });

      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, imageUrl: data.imageUrl } : p))
      );
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploading(null);
    }
  }

  function handleFileSelect(productId: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleUpload(productId, file);
    };
    input.click();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">You must be logged in as an Admin to access this page.</p>
          <a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  const uploadedCount = products.filter(p => p.imageUrl).length;

  return (
    <AdminLayout activePage="images">
      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3E2723]">{products.length}</p>
                <p className="text-xs text-gray-500">Total Products</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3E2723]">{uploadedCount}</p>
                <p className="text-xs text-gray-500">With Images</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3E2723]">{products.length - uploadedCount}</p>
                <p className="text-xs text-gray-500">Need Images</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-[8px] mt-0.5 font-medium">NO IMAGE</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#3E2723] truncate">{product.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                    #{product.id}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{product.category} — ${product.price.toFixed(2)}</p>
                {product.imageUrl ? (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-xs text-green-600">Image uploaded</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <p className="text-xs text-red-500">Missing image</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleFileSelect(product.id)}
                disabled={uploading === product.id}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  uploading === product.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : product.imageUrl
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] shadow-sm hover:shadow'
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploading === product.id ? 'Uploading...' : product.imageUrl ? 'Replace' : 'Upload'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
