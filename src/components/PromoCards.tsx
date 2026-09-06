import { Code2, ArrowRight, Store } from 'lucide-react';

export function PromoCards() {
  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4 max-w-4xl space-y-4">
        {/* Web Dev Promo */}
        <div className="bg-gradient-to-r from-[#F9A825]/15 to-[#F9A825]/5 border border-[#F9A825]/40 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#F9A825]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-[#3E2723]" />
            </div>
            <p className="text-[#3E2723] font-medium">
              Need a website for your business — e-commerce or otherwise?{' '}
              <span className="font-semibold">We build those too.</span>
            </p>
          </div>
          <a
            href="/contact?subject=Website%20%2F%20App%20Development"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9A825] text-[#3E2723] font-bold rounded-lg hover:bg-[#FFB300] transition-colors shadow-sm"
          >
            Get in touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Sugbo Delights NZ Promo */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200">
              <Store className="w-5 h-5 text-[#3E2723]" />
            </div>
            <p className="text-gray-600">
              Also check out{' '}
              <span className="text-[#3E2723] font-semibold">Sugbo Delights NZ</span> — another
              local favourite, built by the same developer. Take a look at what they offer.
            </p>
          </div>
          <a
            href="https://sugbodelightsnz.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-[#3E2723] font-medium rounded-lg hover:bg-white transition-colors"
          >
            Visit Sugbo Delights <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
