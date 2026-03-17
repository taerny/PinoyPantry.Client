import { Shield, Home, LogOut, LayoutDashboard, Package, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  activePage: 'dashboard' | 'products' | 'settings';
}

export function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'products' as const, label: 'Products', icon: Package, href: '/admin/products' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#1a1a2e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D32F2F] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wide">
                  <span className="text-[#F9A825]">PINOY</span>PANTRY
                  <span className="text-[#F9A825] text-xs ml-2 font-normal">ADMIN</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
            <nav className="flex items-center gap-1 py-1">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    activePage === item.id
                      ? 'text-[#F9A825] bg-white/5 font-medium'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
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
