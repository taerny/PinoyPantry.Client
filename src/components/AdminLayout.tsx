import { Shield, Home, LogOut, LayoutDashboard, Package, Settings, Upload, Image, ClipboardList, Mail, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, type ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';
export const NEWSLETTER_LAST_SEEN_KEY = 'pp_admin_newsletter_last_seen';
export const PASABUY_LAST_SEEN_KEY = 'pp_admin_pasabuy_last_seen';

interface AdminLayoutProps {
  children: ReactNode;
  activePage: 'dashboard' | 'products' | 'import' | 'settings' | 'hero' | 'orders' | 'newsletter' | 'pasabuy';
}

export function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [newSubscriberCount, setNewSubscriberCount] = useState(0);
  const [newPasabuyCount, setNewPasabuyCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/newsletter/subscribers`, {
      headers: { 'Authorization': `Bearer ${user.token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then((subs: { subscribedAt: string }[]) => {
        const lastSeen = localStorage.getItem(NEWSLETTER_LAST_SEEN_KEY);
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        setNewSubscriberCount(subs.filter(s => new Date(s.subscribedAt).getTime() > lastSeenTime).length);
      })
      .catch(() => {});

    fetch(`${API_URL}/api/pasabuy`, {
      headers: { 'Authorization': `Bearer ${user.token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then((orders: { createdAt: string }[]) => {
        const lastSeen = localStorage.getItem(PASABUY_LAST_SEEN_KEY);
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        setNewPasabuyCount(orders.filter(o => new Date(o.createdAt).getTime() > lastSeenTime).length);
      })
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', badge: 0 },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList, href: '/admin/orders', badge: 0 },
    { id: 'pasabuy' as const, label: 'Pasabuy', icon: ShoppingBag, href: '/admin/pasabuy', badge: newPasabuyCount },
    { id: 'products' as const, label: 'Products', icon: Package, href: '/admin/products', badge: 0 },
    { id: 'import' as const, label: 'Import', icon: Upload, href: '/admin/import', badge: 0 },
    { id: 'hero' as const, label: 'Hero Section', icon: Image, href: '/admin/hero', badge: 0 },
    { id: 'newsletter' as const, label: 'Newsletter', icon: Mail, href: '/admin/newsletter', badge: newSubscriberCount },
    { id: 'settings' as const, label: 'Settings', icon: Settings, href: '/admin/settings', badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#1a1a2e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold tracking-wide truncate">
                  <span className="text-[#F9A825]">PINOY</span>PANTRY
                  <span className="hidden sm:inline text-[#F9A825] text-xs ml-2 font-normal">ADMIN</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span>{user.fullName}</span>
              </div>
              <a href="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Store</span>
              </a>
              <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#16213e] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 py-1 overflow-x-auto">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    activePage === item.id
                      ? 'text-[#F9A825] bg-white/5 font-medium'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="bg-[#D32F2F] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
