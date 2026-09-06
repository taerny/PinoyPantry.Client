import { useState, useEffect } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
}

export function AdminNewsletterPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) fetchSubscribers();
  }, [authLoading, user, isAdmin]);

  async function fetchSubscribers() {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribers`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (res.ok) setSubscribers(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function copyAllEmails() {
    navigator.clipboard.writeText(subscribers.map(s => s.email).join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  return (
    <AdminLayout activePage="newsletter">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2"><Mail className="w-5 h-5" /> Newsletter Subscribers</h2>
            <p className="text-xs text-gray-400 mt-0.5">Everyone who signed up via the homepage "Stay Connected" form.</p>
          </div>
          {subscribers.length > 0 && (
            <button
              onClick={copyAllEmails}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[#3E2723] text-white hover:bg-[#2C1A17] flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All Emails'}
            </button>
          )}
        </div>

        {subscribers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No subscribers yet — they'll show up here once customers sign up.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[75vh]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{s.email}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      {new Date(s.subscribedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">{subscribers.length} total subscriber{subscribers.length === 1 ? '' : 's'}.</p>
      </div>
    </AdminLayout>
  );
}
