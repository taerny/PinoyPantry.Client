import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, Settings, ArrowLeft, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';
import { PasabuySettingsService, FALLBACK_PASABUY_SETTINGS, type PasabuySettings } from '../services/pasabuySettingsService';

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-transparent';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function AdminPasabuySettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<PasabuySettings>(FALLBACK_PASABUY_SETTINGS);
  // Lists are edited as plain text, one entry per line.
  const [howItWorksText, setHowItWorksText] = useState('');
  const [pleaseNoteText, setPleaseNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function load(s: PasabuySettings) {
    setSettings(s);
    setHowItWorksText(s.howItWorks.join('\n'));
    setPleaseNoteText(s.pleaseNote.join('\n'));
  }

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      PasabuySettingsService.get()
        .then(load)
        .catch(() => setMessage({ type: 'error', text: 'Failed to load Pasabuy settings.' }))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, isAdmin]);

  function set<K extends keyof PasabuySettings>(key: K, value: PasabuySettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function save(next: PasabuySettings, successText?: string) {
    if (!user) return;
    setMessage(null);
    setSaving(true);
    try {
      const updated = await PasabuySettingsService.update(
        {
          ...next,
          howItWorks: howItWorksText.split('\n').map(l => l.trim()).filter(Boolean),
          pleaseNote: pleaseNoteText.split('\n').map(l => l.trim()).filter(Boolean),
        },
        user.token,
      );
      load(updated);
      setMessage({
        type: 'success',
        text: successText ?? (updated.isOpen ? 'Saved! Orders are OPEN on the homepage.' : 'Saved! Orders are currently CLOSED on the homepage.'),
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  const statusText = settings.forceClosed
    ? 'Closed manually'
    : settings.isOpen ? 'Open' : 'Closed — cut-off date has passed';

  return (
    <AdminLayout activePage="pasabuy">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/admin/pasabuy" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D32F2F] mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Pasabuy orders
        </Link>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2"><Settings className="w-5 h-5" /> Pasabuy Settings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Everything shown in the homepage Pasabuy section. Use <code className="bg-gray-100 px-1 rounded">{'{cutoff}'}</code> in any text to show the cut-off date automatically.</p>
          </div>
          <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${settings.isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {statusText}
          </span>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); save(settings); }} className="space-y-6">
          {/* Shipment: dates + open/close */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-[#3E2723]">This shipment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Order cut-off date" hint="Last day orders are accepted (NZ time). The form closes by itself after this date.">
                <input type="date" required value={settings.cutoffDate} onChange={e => set('cutoffDate', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Estimated arrival">
                <input type="text" value={settings.estimatedArrival} onChange={e => set('estimatedArrival', e.target.value)} className={inputClass} placeholder="e.g. Last week of December 2026" />
              </Field>
            </div>
            <Field label="Collection">
              <input type="text" value={settings.collection} onChange={e => set('collection', e.target.value)} className={inputClass} />
            </Field>

            <div className="flex items-center justify-between gap-3 pt-3 border-t">
              <div className="text-sm text-gray-600">
                <p className="font-medium text-[#3E2723]">{settings.forceClosed ? 'Orders are manually closed' : 'Close orders manually'}</p>
                <p className="text-xs text-gray-400">Use this if the shipment is full before the cut-off date.</p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => save({ ...settings, forceClosed: !settings.forceClosed }, settings.forceClosed ? 'Orders re-opened (if the cut-off date allows).' : 'Orders closed now.')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${settings.forceClosed ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
              >
                {settings.forceClosed ? <><Unlock className="w-4 h-4" /> Re-open orders</> : <><Lock className="w-4 h-4" /> Close orders now</>}
              </button>
            </div>
          </div>

          {/* Header wording */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-[#3E2723]">Section heading</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Badge (orders open)">
                <input type="text" required value={settings.badgeText} onChange={e => set('badgeText', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Badge (orders closed)">
                <input type="text" value={settings.closedBadgeText} onChange={e => set('closedBadgeText', e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Heading">
              <input type="text" required value={settings.heading} onChange={e => set('heading', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Intro text">
              <textarea rows={3} value={settings.intro} onChange={e => set('intro', e.target.value)} className={inputClass + ' resize-none'} />
            </Field>
          </div>

          {/* Order form wording */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-[#3E2723]">Order form</h3>
            <Field label="Form title">
              <input type="text" value={settings.formTitle} onChange={e => set('formTitle', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Message above the form" hint="Example: Limited shipment capacity available, so get your orders in before {cutoff}! — the date fills in by itself.">
              <textarea rows={2} value={settings.formBlurb} onChange={e => set('formBlurb', e.target.value)} className={inputClass + ' resize-none'} />
            </Field>
            <Field label="Message shown when orders are closed">
              <textarea rows={3} value={settings.closedMessage} onChange={e => set('closedMessage', e.target.value)} className={inputClass + ' resize-none'} />
            </Field>
          </div>

          {/* Info cards */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-[#3E2723]">Info cards</h3>
            <Field label="How It Works" hint="One step per line.">
              <textarea rows={6} value={howItWorksText} onChange={e => setHowItWorksText(e.target.value)} className={inputClass + ' resize-y'} />
            </Field>
            <Field label="Pricing">
              <textarea rows={4} value={settings.pricingText} onChange={e => set('pricingText', e.target.value)} className={inputClass + ' resize-y'} />
            </Field>
            <Field label="Please Note" hint="One note per line.">
              <textarea rows={6} value={pleaseNoteText} onChange={e => setPleaseNoteText(e.target.value)} className={inputClass + ' resize-y'} />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <a href="/#pasabuy" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D32F2F] hover:underline">View on homepage ↗</a>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
