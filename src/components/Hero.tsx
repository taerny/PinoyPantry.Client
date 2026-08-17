export function Hero() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#3E2723]">
            Real Filipino Flavors <br />
            <span className="text-[#D32F2F]">Straight From the Pantry</span>
          </h1>
          <p className="text-xl font-medium mb-8 text-[#6D4C41]">
            From classic canned goods to your favorite snacks — everything you need to bring the taste of home to your kitchen.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#D32F2F] text-white px-8 py-3 rounded-lg hover:bg-[#B71C1C] transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
