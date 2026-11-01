const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

export interface PasabuySettings {
  badgeText: string;
  closedBadgeText: string;
  heading: string;
  intro: string;
  cutoffDate: string; // yyyy-MM-dd, last day orders are accepted (NZ time)
  estimatedArrival: string;
  collection: string;
  formTitle: string;
  formBlurb: string; // may contain {cutoff}
  howItWorks: string[];
  pricingText: string;
  pleaseNote: string[];
  closedMessage: string;
  forceClosed: boolean;
  // Computed by the server — ignored on save.
  isOpen: boolean;
  cutoffDisplay: string;
}

// Shown only if the settings request fails, so the section never renders blank. The server
// returns the same wording by default, so this rarely differs from what the admin sees.
export const FALLBACK_PASABUY_SETTINGS: PasabuySettings = {
  badgeText: '🇵🇭 PASABUY — ORDERS NOW OPEN 🇳🇿',
  closedBadgeText: '🇵🇭 PASABUY — ORDERS CLOSED 🇳🇿',
  heading: 'Filipino Grocery Pasabuy',
  intro: 'Missing your favourite Filipino snacks, biscuits, canned goods and pantry essentials?\nWe\'re now taking orders for our next Filipino grocery shipment! 🇵🇭❤️',
  cutoffDate: '',
  estimatedArrival: '',
  collection: 'Dunedin, NZ',
  formTitle: 'Send Us Your Order',
  formBlurb: '',
  howItWorks: [],
  pricingText: '',
  pleaseNote: [],
  closedMessage: 'Orders are currently closed. Please check back soon!',
  forceClosed: false,
  isOpen: false,
  cutoffDisplay: '',
};

// Replaces the {cutoff} placeholder with the formatted cut-off date, so changing the date in the
// admin updates every sentence that mentions it.
export function withCutoff(text: string, settings: PasabuySettings) {
  return text.split('{cutoff}').join(settings.cutoffDisplay);
}

export const PasabuySettingsService = {
  async get(): Promise<PasabuySettings> {
    const res = await fetch(`${API_URL}/api/pasabuy-settings`);
    if (!res.ok) throw new Error('Failed to load Pasabuy settings');
    return res.json();
  },

  async update(settings: PasabuySettings, token: string): Promise<PasabuySettings> {
    const res = await fetch(`${API_URL}/api/pasabuy-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to save Pasabuy settings');
    return data;
  },
};
