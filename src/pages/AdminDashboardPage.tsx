import { useState, useEffect } from 'react';
import { Package, Users, Tag, DollarSign, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  productsWithImages: number;
  totalCategories: number;
  totalInventoryValue: number;
  categoryStats: { category: string; count: number }[];
  recentProducts: { id: number; name: string; category: string; price: number; hasImage: boolean }[];
}

export function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchStats();
    }
  }, [authLoading, user, isAdmin]);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_URL}/api/auth/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${user!.token}` }
      });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;
  }
  if (!stats) {
    return <AdminLayout activePage="dashboard"><div className="max-w-7xl mx-auto px-4 py-8 text-gray-500">Failed to load dashboard.</div></AdminLayout>;
  }

  return (
    <AdminLayout activePage="dashboard">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-[#3E2723] mb-6">Dashboard Overview</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-[#3E2723]">{stats.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-1">Total Products</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-[#3E2723]">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Registered Users</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-[#3E2723]">{stats.totalCategories}</p>
            <p className="text-xs text-gray-500 mt-1">Categories</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-[#3E2723]">${stats.totalInventoryValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Inventory Value</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-[#3E2723] mb-4">Products by Category</h3>
            <div className="space-y-3">
              {stats.categoryStats.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#3E2723] font-medium">{cat.category}</span>
                      <span className="text-gray-500">{cat.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#D32F2F] h-2 rounded-full transition-all"
                        style={{ width: `${(cat.count / stats.totalProducts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-[#3E2723] mb-4">Recent Products</h3>
            <div className="space-y-3">
              {stats.recentProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.hasImage ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <ImageIcon className={`w-4 h-4 ${p.hasImage ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3E2723] truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#3E2723]">${p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-[#3E2723] mb-2">Quick Stats</h3>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Images uploaded: <strong className="text-[#3E2723]">{stats.productsWithImages}</strong> / {stats.totalProducts}</span>
            <span>Missing images: <strong className="text-red-600">{stats.totalProducts - stats.productsWithImages}</strong></span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
