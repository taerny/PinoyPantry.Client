import { useState, useEffect } from 'react';
import { Check, AlertCircle, Layout as LayoutIcon, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';
import { HeroContentService, DEFAULT_HERO_CONTENT, type HeroContent } from '../services/heroContentService';

export function AdminHeroPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [content, setContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      HeroContentService.getHeroContent()
        .then(setContent)
        .catch(() => setMessage({ type: 'error', text: 'Failed to load hero content.' }))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, isAdmin]);

  async function saveContent() {
    if (!user) return;
    setMessage(null);
    setSaving(true);
    try {
      const updated = await HeroContentService.updateHeroContent(content, user.token);
      setContent(updated);
      setMessage({ type: 'success', text: 'Changes saved!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveContent();
  }

  async function toggleMaintenanceMode() {
    if (!user) return;
    setMessage(null);
    setTogglingMaintenance(true);
    const next = { ...content, isMaintenanceMode: !content.isMaintenanceMode };
    try {
      const updated = await HeroContentService.updateHeroContent(next, user.token);
      setContent(updated);
      setMessage({
        type: 'success',
        text: updated.isMaintenanceMode ? 'Maintenance mode is ON — the site now shows the maintenance page to visitors.' : 'Maintenance mode is OFF — the site is live again.',
      });
    } catch {
      setMessage({ type: 'error', text: 'Failed to toggle maintenance mode.' });
    } finally {
      setTogglingMaintenance(false);
    }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  return (
    <AdminLayout activePage="hero">
      <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#3E2723] mb-6">Site Content</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className={`rounded-xl shadow-sm border p-5 mb-8 ${content.isMaintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#3E2723] flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Maintenance Mode
              </h3>
              <button
                onClick={toggleMaintenanceMode}
                disabled={togglingMaintenance}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                  content.isMaintenanceMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {togglingMaintenance ? 'Updating...' : content.isMaintenanceMode ? 'ON — Click to go live' : 'OFF — Site is live'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              When ON, visitors see the maintenance page instead of the site. You'll still be able to log in and manage everything here.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Headline</label>
                <input
                  type="text"
                  value={content.maintenanceHeadline}
                  onChange={e => setContent({ ...content, maintenanceHeadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
                <textarea
                  value={content.maintenanceMessage}
                  onChange={e => setContent({ ...content, maintenanceMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                />
              </div>
            </div>
            <button
              onClick={saveContent}
              disabled={saving}
              className="mt-4 px-6 py-2.5 bg-[#3E2723] text-white rounded-xl text-sm font-medium hover:bg-[#2C1A17] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Message'}
            </button>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 mb-2">Top Bar</h3>
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border p-5 space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
              <input
                type="text"
                value={content.topBarText}
                onChange={e => setContent({ ...content, topBarText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#3E2723] text-white rounded-xl text-sm font-medium hover:bg-[#2C1A17] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <h3 className="text-sm font-semibold text-gray-500 mb-2">Homepage Hero Section</h3>
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline (first line)</label>
              <input
                type="text"
                value={content.headline}
                onChange={e => setContent({ ...content, headline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Text (second line, shown in red)</label>
              <input
                type="text"
                value={content.highlightedText}
                onChange={e => setContent({ ...content, highlightedText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
              <textarea
                value={content.subtext}
                onChange={e => setContent({ ...content, subtext: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={content.buttonText}
                  onChange={e => setContent({ ...content, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={content.buttonLink}
                  onChange={e => setContent({ ...content, buttonLink: e.target.value })}
                  placeholder="/category/all-products"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#3E2723] text-white rounded-xl text-sm font-medium hover:bg-[#2C1A17] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <h3 className="text-sm font-semibold text-gray-500 mb-2 mt-8">Footer</h3>
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">"About" Text (under the logo)</label>
              <textarea
                value={content.footerAboutText}
                onChange={e => setContent({ ...content, footerAboutText: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#3E2723] text-white rounded-xl text-sm font-medium hover:bg-[#2C1A17] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <LayoutIcon className="w-4 h-4" />
            Live Preview
          </h3>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-6">
            <section className="bg-[#F9A825] py-2 px-4">
              <p className="text-center text-xs font-medium text-[#3E2723]">
                {content.topBarText || 'Top bar announcement'}
              </p>
            </section>
            <section className="bg-white p-6">
              <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-[#3E2723]" style={{ fontFamily: "'Baloo 2', 'Poppins', sans-serif" }}>
                {content.headline || 'Headline'} <br />
                <span className="text-[#D32F2F]">{content.highlightedText || 'Highlighted text'}</span>
              </h1>
              <p className="text-sm font-medium mb-4 text-[#6D4C41]">
                {content.subtext || 'Subtext'}
              </p>
              <button type="button" className="bg-[#D32F2F] text-white px-5 py-2 rounded-lg text-sm">
                {content.buttonText || 'Button'}
              </button>
            </section>
            <section className="bg-[#3E2723] p-6">
              <img src="/images/logo.png" alt="PinoyPantry Logo" className="h-10 w-auto mb-3" />
              <p className="text-white/80 text-sm">
                {content.footerAboutText || 'Footer about text'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
