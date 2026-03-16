import { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onClose: () => void;
}

export function LoginPage({ onClose }: LoginPageProps) {
  const { login, register, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess(`Welcome back!`);
        setTimeout(() => onClose(), 1000);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        });
        setSuccess('Account created! Redirecting...');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="text-[#F9A825]">PINOY</span>
              <span className="text-[#3E2723]">PANTRY</span>
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold text-[#3E2723] mb-2">Welcome, {user.fullName}!</h2>
            <p className="text-gray-500 mb-1">{user.email}</p>
            <p className="text-sm text-[#D32F2F] font-medium mb-6">Role: {user.role}</p>
            <button
              onClick={onClose}
              className="w-full bg-[#D32F2F] text-white py-3 rounded-lg hover:bg-[#B71C1C] transition-colors mb-3"
            >
              Continue Shopping
            </button>
            {user.role === 'Admin' && (
              <a
                href="/admin/dashboard"
                className="block w-full bg-blue-50 text-blue-600 py-3 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
              >
                Go to Admin Panel
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <button onClick={onClose} className="inline-block">
            <h1 className="text-3xl mb-2">
              <span className="text-[#F9A825]">PINOY</span>
              <span className="text-[#3E2723]">PANTRY</span>
            </h1>
            <p className="text-sm text-[#D32F2F] italic">Pasabuy Na Ba!</p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
              className={`pb-3 px-4 transition-colors ${
                isLogin
                  ? 'border-b-2 border-[#D32F2F] text-[#D32F2F]'
                  : 'text-muted-foreground hover:text-[#3E2723]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
              className={`pb-3 px-4 transition-colors ${
                !isLogin
                  ? 'border-b-2 border-[#D32F2F] text-[#D32F2F]'
                  : 'text-muted-foreground hover:text-[#3E2723]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="juan@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D32F2F] text-white py-3 rounded-lg hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="juan@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="City, Province"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                    placeholder="Create a password (min 6 characters)"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D32F2F] text-white py-3 rounded-lg hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="text-[#3E2723] hover:text-[#D32F2F] transition-colors"
          >
            &larr; Back to Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
