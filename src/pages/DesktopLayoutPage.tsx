export function DesktopLayoutPage() {
  return (
    <div className="min-h-screen bg-[#050822] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1280px] aspect-[16/9] bg-[#04061a] overflow-hidden relative">
        {/* Top comparison section */}
        <div className="relative h-[84%] flex">
          {/* Left panel */}
          <div className="relative w-[52%] h-full shrink-0">
            <img
              src="http://photos.iconsportswire.com/images/watermark/2026/02/08/dmk2602083110_sblx.jpg"
              alt="Defense players"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0d1385]/65" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1385]/30 to-[#0a0f5d]/85" />

            <div className="absolute top-5 left-0">
              <div
                className="bg-red-600 text-white text-sm md:text-[28px] font-extrabold uppercase tracking-wide py-3 md:py-4 pl-5 md:pl-8 pr-10 md:pr-14"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 94% 100%, 0% 100%)' }}
              >
                Favorable Matchup
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pr-12">
              <h2 className="text-2xl md:text-5xl font-black leading-none">
                <span className="text-red-500">.846 </span>
                <span className="text-white" style={{ WebkitTextStroke: '1.5px #dc2626' }}>
                  WIN
                </span>
              </h2>
              <h3
                className="text-white text-2xl md:text-5xl font-black uppercase leading-[0.95] mt-1"
                style={{ WebkitTextStroke: '1.5px #dc2626' }}
              >
                Percentage
              </h3>
              <p className="text-red-500 text-sm md:text-[22px] font-medium uppercase leading-[1.15] tracking-wide mt-5 md:mt-8">
                When forcing 1 or more
                <br />
                turnovers this season
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div
            className="relative w-[56%] h-full -ml-[8%] z-[2]"
            style={{ clipPath: 'polygon(14% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          >
            <img
              src="http://photos.iconsportswire.com/images/watermark/2025/12/07/dkb251207023_sea_vs_atl.jpg"
              alt="Offense players"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0a3f85]/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a4e92]/30 to-[#04195f]/85" />

            <div className="absolute top-4 right-6 text-right">
              <p className="text-white/70 text-[10px] md:text-sm font-semibold uppercase tracking-wide">Brought to you by</p>
              <p className="text-white text-xl md:text-4xl font-bold">Inside Edge</p>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pl-12">

              <p className="text-lime-400 text-base md:text-[28px] font-semibold uppercase tracking-wide">
                Seahawks Offense
              </p>
              <h2 className="text-2xl md:text-5xl font-black leading-none mt-1">
                <span className="text-lime-400">27 </span>
                <span className="text-white" style={{ WebkitTextStroke: '1.5px #22c55e' }}>
                  Giveaways
                </span>
              </h2>
              <h3
                className="text-white text-2xl md:text-5xl font-black uppercase leading-[0.95] mt-1"
                style={{ WebkitTextStroke: '1.5px #22c55e' }}
              >
                This Season
              </h3>
            </div>
          </div>

          {/* VS badge */}
          <div className="absolute left-[48%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-[6]">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] shadow-lg flex items-center justify-center"
              style={{ background: 'conic-gradient(from 0deg, #00119b 0deg 180deg, #dc2626 180deg 360deg)' }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-black text-2xl md:text-[42px] font-black uppercase">vs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stat bars */}
        <div className="relative h-[16%] flex">
          <div
            className="w-[52%] bg-red-600 flex items-center justify-center pr-[10%]"
            style={{ clipPath: 'polygon(0% 0%, 84.62% 0%, 81.74% 100%, 0% 100%)' }}
          >
            <p className="text-white text-lg md:text-[34px] font-medium uppercase tracking-wide">4th Best in the NFL</p>
          </div>
          <div
            className="w-[57.5%] -ml-[9.5%] bg-[#0a138e] flex items-center justify-center pl-[8%]"
            style={{ clipPath: 'polygon(2.61% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          >
            <p className="text-white text-lg md:text-[34px] font-medium uppercase tracking-wide">2nd Most in the NFL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
