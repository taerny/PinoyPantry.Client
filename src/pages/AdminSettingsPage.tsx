import { useState, useEffect } from 'react';
import { Lock, Check, AlertCircle, Mail, Clock, Calendar, Shield as ShieldIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface Profile {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export function AdminSettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) fetchProfile();
  }, [authLoading, user, isAdmin]);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${user!.token}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage(null);

    if (passwords.newPw !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.newPw.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setChanging(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current: '', newPw: '', confirm: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally { setChanging(false); }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  return (
    <AdminLayout activePage="settings">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-[#3E2723] mb-6">Account Settings</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-[#3E2723]">Account Information</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-2xl font-bold">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#3E2723]">{profile.fullName}</p>
                  <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${profile.role === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {profile.role}
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-[#3E2723]">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ShieldIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-[#3E2723]">{profile.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-[#3E2723]">{new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-[#3E2723]">{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'First login'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-[#3E2723] flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Change Password
            </h3>
          </div>
          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={passwords.newPw} onChange={e => setPasswords({...passwords, newPw: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]" required />
            </div>
            <button type="submit" disabled={changing} className="px-6 py-2.5 bg-[#3E2723] text-white rounded-xl text-sm font-medium hover:bg-[#2C1A17] transition-colors disabled:opacity-50">
              {changing ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
