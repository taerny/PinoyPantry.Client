import { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, ArrowLeft, Image as ImageIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, isAdmin, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#3E2723]">Product Image Manager</h1>
            <p className="text-sm text-gray-500">Logged in as {user.fullName} ({user.role})</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4">
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[9px] mt-1">No Image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#3E2723] truncate">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category} — ${product.price.toFixed(2)}</p>
                {product.imageUrl && (
                  <p className="text-xs text-green-600 mt-1 truncate">Image uploaded</p>
                )}
              </div>

              <button
                onClick={() => handleFileSelect(product.id)}
                disabled={uploading === product.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploading === product.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : product.imageUrl
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploading === product.id ? 'Uploading...' : product.imageUrl ? 'Replace' : 'Upload'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
