import { Instagram, Twitter, Mail, MapPin, Code2, ArrowRight } from 'lucide-react';
import { useHeroContent } from '../contexts/HeroContentContext';

function FacebookF({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" className={className}>
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  );
}

export function Footer() {
  const { content } = useHeroContent();

  return (
    <footer className="bg-gradient-to-b from-[#2E1512] to-[#241009] text-white">
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
              <a
                href="https://www.facebook.com/profile.php?id=61593512277062"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Facebook"
                className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:bg-[#145DBF] transition-colors"
              >
                <FacebookF className="w-5 h-5" />
              </a>
              <span title="Coming soon" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-40 cursor-not-allowed">
                <Instagram className="w-5 h-5" />
              </span>
              <span title="Coming soon" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-40 cursor-not-allowed">
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

        {/* Web Dev Promo */}
        <div className="mt-10 bg-gradient-to-r from-[#F9A825]/15 to-[#F9A825]/5 border border-[#F9A825]/40 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#F9A825]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-[#F9A825]" />
            </div>
            <p className="text-white font-medium">
              Need a website for your business — e-commerce or otherwise?{' '}
              <span className="text-[#F9A825] font-semibold">We build those too.</span>
            </p>
          </div>
          <a
            href="/contact?subject=Website%20%2F%20App%20Development"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9A825] text-[#3E2723] font-bold rounded-lg hover:bg-[#FFB300] transition-colors shadow-sm"
          >
            Get in touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2026 PinoyPantry. All rights reserved. Pasabuy Na Ba!</p>
        </div>
      </div>
    </footer>
  );
}
