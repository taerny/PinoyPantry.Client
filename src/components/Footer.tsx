import { Facebook, Instagram, Twitter, Mail, MapPin } from 'lucide-react';
import { useHeroContent } from '../contexts/HeroContentContext';

export function Footer() {
  const { content } = useHeroContent();

  return (
    <footer className="bg-[#3E2723] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <img 
                src="/images/logo.png" 
                alt="PinoyPantry Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-white/80 mb-4">
              {content.footerAboutText}
            </p>
            <div className="flex gap-3">
              <span title="Coming soon" className="w-10 h-10 bg-[#4A332E] rounded-full flex items-center justify-center opacity-40 cursor-not-allowed">
                <Facebook className="w-5 h-5" />
              </span>
              <span title="Coming soon" className="w-10 h-10 bg-[#4A332E] rounded-full flex items-center justify-center opacity-40 cursor-not-allowed">
                <Instagram className="w-5 h-5" />
              </span>
              <span title="Coming soon" className="w-10 h-10 bg-[#4A332E] rounded-full flex items-center justify-center opacity-40 cursor-not-allowed">
                <Twitter className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><span className="text-white/30 cursor-not-allowed text-sm" title="Coming soon">About Us</span></li>
              <li><a href="/category/all-products" className="text-white/80 hover:text-[#F9A825] transition-colors text-sm">Shop All</a></li>
              <li><span className="text-white/30 cursor-not-allowed text-sm" title="Coming soon">Deals &amp; Promos</span></li>
              <li><span className="text-white/30 cursor-not-allowed text-sm" title="Coming soon">FAQs</span></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="/category/canned-goods" className="text-white/80 hover:text-[#F9A825] transition-colors text-sm">Canned Goods</a></li>
              <li><a href="/category/snacks-chips" className="text-white/80 hover:text-[#F9A825] transition-colors text-sm">Snacks &amp; Chips</a></li>
              <li><a href="/category/instant-noodles" className="text-white/80 hover:text-[#F9A825] transition-colors text-sm">Instant Noodles</a></li>
              <li><a href="/category/beverages" className="text-white/80 hover:text-[#F9A825] transition-colors text-sm">Beverages</a></li>
              <li><a href="/category/condiments" className="text-white/80 hover:text-[#F9A825] transition-colors text-sm">Condiments</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/80">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Dunedin, New Zealand</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0 text-white/80" />
                <a href="/contact" className="text-[#F9A825] hover:underline font-medium">
                  Send us a message
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2026 PinoyPantry. All rights reserved. Pasabuy Na Ba!</p>
        </div>
      </div>
    </footer>
  );
}
