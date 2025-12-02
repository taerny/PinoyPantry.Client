export function Hero() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl mb-4 text-[#3E2723]">
            Authentic Filipino Foods <br />
            <span className="text-[#D32F2F]">Delivered to Your Door</span>
          </h1>
          <p className="text-xl mb-8 text-[#6D4C41]">
            From classic canned goods to your favorite snacks - we bring the taste of home wherever you are!
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#D32F2F] text-white px-8 py-3 rounded-lg hover:bg-[#B71C1C] transition-colors">
              Shop Now
            </button>
            <button className="bg-white border-2 border-[#3E2723] text-[#3E2723] px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              View Deals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
