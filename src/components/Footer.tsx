import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
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
                <span>Dunedin, New Zealand</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+64 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>hello@pinoypantry.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Friend's Business Promotion */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <h4 className="text-center mb-6 text-xl font-semibold text-white">More Taste of Home!</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* No. 8 Neo's Home Cooking */}
            <a 
              href="https://www.facebook.com/profile.php?id=61566011519820" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-r from-[#F9A825] to-[#FFB300] hover:from-[#FFB300] hover:to-[#F9A825] px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center gap-3">
                  <img 
                    src="/images/neo.jpg" 
                    alt="No. 8 Neo's Home Cooking Logo" 
                    className="h-20 w-auto rounded-lg shadow-md"
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-[#3E2723] font-bold text-base group-hover:underline">
                      No. 8 Neo's Home Cooking
                    </span>
                    <span className="text-[#3E2723]/80 text-xs mt-1">
                      Authentic home-cooked Filipino meals
                    </span>
                  </div>
                </div>
              </div>
            </a>

            {/* Bai Lechon */}
            <a 
              href="https://www.facebook.com/profile.php?id=61585550965581" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-r from-[#F9A825] to-[#FFB300] hover:from-[#FFB300] hover:to-[#F9A825] px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center gap-3">
                  <img 
                    src="/images/bai-lechon-logo.jpg" 
                    alt="Bai Lechon Logo" 
                    className="h-20 w-auto rounded-lg shadow-md object-contain"
                    onError={(e) => {
                      // Fallback to Facebook CDN if local image not found
                      e.currentTarget.src = "/images/bai.jpg";
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-[#3E2723] font-bold text-base group-hover:underline">
                      Bai Lechon
                    </span>
                    <span className="text-[#3E2723]/80 text-xs mt-1">
                      Authentic Filipino roasted pig
                    </span>
                  </div>
                </div>
              </div>
            </a>

            {/* Eskina Flavors of Asia */}
            <a 
              href="https://www.facebook.com/eskina.dunners" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-r from-[#F9A825] to-[#FFB300] hover:from-[#FFB300] hover:to-[#F9A825] px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center gap-3">
                  <img 
                    src="/images/eskina.jpg" 
                    alt="Eskina Flavors of Asia Logo" 
                    className="h-20 w-auto rounded-lg shadow-md object-contain"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      console.error('Eskina image failed to load');
                      // Image will just not show if it fails
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-[#3E2723] font-bold text-base group-hover:underline">
                      Eskina Flavors of Asia
                    </span>
                    <span className="text-[#3E2723]/80 text-xs mt-1">
                      Authentic Asian flavors
                    </span>
                  </div>
                </div>
              </div>
            </a>

            {/* Bacolod Inasal */}
            <a 
              href="https://www.facebook.com/profile.php?id=61568213924365" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-r from-[#F9A825] to-[#FFB300] hover:from-[#FFB300] hover:to-[#F9A825] px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center gap-3">
                  <img 
                    src="/images/nameets.jpg" 
                    alt="Bacolod Inasal Logo" 
                    className="h-20 w-auto rounded-lg shadow-md object-contain"
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-[#3E2723] font-bold text-base group-hover:underline">
                      Bacolod Inasal
                    </span>
                    <span className="text-[#3E2723]/80 text-xs mt-1">
                      Authentic Ilonggo chargrilled food
                    </span>
                  </div>
                </div>
              </div>
            </a>
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
