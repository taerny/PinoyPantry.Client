const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

export interface HeroContent {
  headline: string;
  highlightedText: string;
  subtext: string;
  buttonText: string;
  buttonLink: string;
  footerAboutText: string;
  topBarText: string;
  isMaintenanceMode: boolean;
  maintenanceHeadline: string;
  maintenanceMessage: string;
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
  headline: 'Real Filipino Flavours',
  highlightedText: 'From Our Pantry to Yours',
  subtext: 'From classic canned goods to your favorite snacks — everything you need to bring the taste of home to your kitchen.',
  buttonText: 'Shop Now',
  buttonLink: '/category/all-products',
  footerAboutText: 'Your one-stop shop for authentic Filipino foods. Bringing the taste of home to you!',
  topBarText: 'Proudly Filipino-owned, serving New Zealand 🇳🇿',
  // Fail-closed: if the hero content fetch ever can't reach the API (CORS gap on a
  // new domain, transient outage), default to showing maintenance rather than
  // silently exposing the real site. A logged-in admin still bypasses this via
  // isAdmin, which is independent of this fetch — so this has no admin-side cost.
  isMaintenanceMode: true,
  maintenanceHeadline: "We're Cooking Up Something New!",
  maintenanceMessage: "PinoyPantry is getting a fresh batch of updates. Balik kami agad — hang tight, we'll be back before you can say 'Pasabuy!'",
};

export class HeroContentService {
  static async getHeroContent(): Promise<HeroContent> {
    const res = await fetch(`${API_URL}/api/herocontent`);
    if (!res.ok) throw new Error('Failed to fetch hero content');
    return res.json();
  }

  static async updateHeroContent(content: HeroContent, token: string): Promise<HeroContent> {
    const res = await fetch(`${API_URL}/api/herocontent`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(content),
    });
    if (!res.ok) throw new Error('Failed to update hero content');
    return res.json();
  }
}
