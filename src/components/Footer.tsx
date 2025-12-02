import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#3E2723] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="mb-4">
              <span className="text-[#F9A825]">PINOY</span>
              <span className="text-white">PANTRY</span>
            </h3>
            <p className="text-white/80 mb-4">
              Your one-stop shop for authentic Filipino foods. Bringing the taste of home to you!
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-[#4A332E] rounded-full flex items-center justify-center hover:bg-[#F9A825] hover:text-[#3E2723] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#4A332E] rounded-full flex items-center justify-center hover:bg-[#F9A825] hover:text-[#3E2723] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#4A332E] rounded-full flex items-center justify-center hover:bg-[#F9A825] hover:text-[#3E2723] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Shop All</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Deals & Promos</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Track Order</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Canned Goods</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Snacks & Chips</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Instant Noodles</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Beverages</a></li>
              <li><a href="#" className="text-white/80 hover:text-[#F9A825] transition-colors">Condiments</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/80">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>123 Filipino Street, Manila, Philippines</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+63 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>hello@pinoypantry.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2024 PinoyPantry. All rights reserved. Pasabuy Na Ba!</p>
        </div>
      </div>
    </footer>
  );
}
