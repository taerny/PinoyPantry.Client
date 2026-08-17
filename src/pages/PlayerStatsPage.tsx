export function PlayerStatsPage() {
  // Hero row is shorter than the full card half; clip-path % is relative to each box's height.
  // If the white strip used full-half % on the hero row, its slope did not match the blue panel.
  // f ≈ (halfHeight − footer) / halfHeight for 1100px card, py-6 footer (~72px) on ~550px half.
  const f = 0.869;
  const d = 14 * f;

  // Card 1 — white strip between L1 (52→52−d) and L2 (52.7→52.7−d) in card X %
  const c1TopWhite = `polygon(52% 0%, 52.7% 0%, ${(52.7 - d).toFixed(3)}% 100%, ${(52 - d).toFixed(3)}% 100%)`;
  const c1BotWhite = `polygon(${(52 - d).toFixed(3)}% 0%, ${(52.7 - d).toFixed(3)}% 0%, 38.7% 100%, 38% 100%)`;
  // Blue is 65% wide starting at 35% card; left edge follows L2 (right side of white toward blue)
  const c1BlueTop = ((52.7 - 35) / 65) * 100;
  const c1BlueBot = ((52.7 - d - 35) / 65) * 100;
  const c1Blue = `polygon(${c1BlueTop.toFixed(2)}% 0%, 100% 0%, 100% 100%, ${c1BlueBot.toFixed(2)}% 100%)`;

  // Card 2 — mirrored diagonal (strip between 47.3→47.3+d and 48→48+d)
  const c2TopWhite = `polygon(47.3% 0%, 48% 0%, ${(48 + d).toFixed(3)}% 100%, ${(47.3 + d).toFixed(3)}% 100%)`;
  const c2BotWhite = `polygon(${(47.3 + d).toFixed(3)}% 0%, ${(48 + d).toFixed(3)}% 0%, 62% 100%, 61.3% 100%)`;
  const c2BlueTop = (47.3 / 65) * 100;
  const c2BlueBot = ((47.3 + d) / 65) * 100;
  const c2Blue = `polygon(0% 0%, ${c2BlueTop.toFixed(2)}% 0%, ${c2BlueBot.toFixed(2)}% 100%, 0% 100%)`;

  // Footer bars (75% wide): align clipped edge to the same L2 / mirrored L as the white strip
  const c1RedLeftCard = 52 - 27; // flex: PrizePicks 52%, red -ml-[27%]
  const c1RedTop = ((52.7 - d - c1RedLeftCard) / 75) * 100;
  const c1RedBot = ((38.7 - c1RedLeftCard) / 75) * 100;
  const c1Red = `polygon(${c1RedTop.toFixed(3)}% 0%, 100% 0%, 100% 100%, ${c1RedBot.toFixed(3)}% 100%)`;

  const c2NavyTop = ((47.3 + d) / 75) * 100;
  const c2NavyBot = (61.3 / 75) * 100;
  const c2Navy = `polygon(0% 0%, ${c2NavyTop.toFixed(3)}% 0%, ${c2NavyBot.toFixed(3)}% 100%, 0% 100%)`;

  return (
    <div className="min-h-screen bg-[#0d0f24] flex flex-col items-center justify-center">
      <div className="flex flex-col" style={{ width: '700px', height: '1100px' }}>
        {/* Card 1: Image Left / Stats Right */}
        <div className="overflow-hidden flex flex-col relative h-1/2">
          <div className="relative flex min-h-0 flex-1 flex-row">
            {/* Left - Player Image */}
            <div className="relative w-[52%] shrink-0">
              <img
                src="http://photos.iconsportswire.com/images/watermark/2025/07/20/749025072051_sdg_v_was.jpg"
                alt="Xander Bogaerts"
                className="h-full w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-0 z-[1]">
                <div
                  className="flex items-center gap-2 bg-red-600 py-2.5 pl-4 pr-6 text-sm font-bold uppercase tracking-wider text-white"
                  style={{ clipPath: 'polygon(0% 0%, 100% 0%, 96% 100%, 0% 100%)' }}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                  Favorable Matchup
                </div>
              </div>
            </div>

            {/* Right — blue left edge matches L2 of white strip (same row = same slope) */}
            <div
              className="relative z-[2] -ml-[17%] flex w-[65%] flex-col justify-center self-stretch py-6 pl-[14%] pr-4 text-center"
              style={{
                clipPath: c1Blue,
                WebkitClipPath: c1Blue,
                background: 'linear-gradient(to bottom, #01017a 0%, #010158 60%, #000033 100%)',
              }}
            >
              <div className="mb-4">
                <span className="inline-block rounded-sm bg-red-600 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white">
                  Xander Bogaerts
                </span>
              </div>
              <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-wide text-white">Slugging</h2>
              <div className="my-2 text-[5.5rem] font-black leading-none tracking-tight text-white">.446</div>
              <p className="text-xs font-semibold uppercase leading-relaxed tracking-[0.15em] text-gray-300">
                On Non-Fastballs
                <br />
                Down This Season
              </p>
            </div>

            <div
              className="pointer-events-none absolute inset-0 z-[3]"
              style={{ clipPath: c1TopWhite, background: 'white' }}
            />
          </div>

          {/* Bottom: PrizePicks + 11th Best + continuation of diagonal */}
          <div className="relative flex shrink-0 flex-row">
            <div className="flex w-[52%] shrink-0 items-center justify-center gap-2 bg-[#0c0315] py-6 pr-[24%]">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
                <span className="text-[0.55rem] font-bold text-white">P</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">PrizePicks</span>
            </div>
            <div
              className="relative z-[2] -ml-[27%] flex w-[75%] items-center justify-center bg-red-600 py-6 pl-[20%] pr-[4%]"
              style={{ clipPath: c1Red, WebkitClipPath: c1Red }}
            >
              <p className="text-lg font-extrabold uppercase tracking-wide text-white">11th Best in the MLB</p>
            </div>
            <div
              className="pointer-events-none absolute inset-0 z-[3]"
              style={{ clipPath: c1BotWhite, background: 'white' }}
            />
          </div>
        </div>

        {/* Card 2: Stats Left / Image Right (mirrored) */}
        <div className="overflow-hidden flex flex-col relative h-1/2">
          <div className="relative flex min-h-0 flex-1 flex-row">
            {/* Left - Stats */}
            <div
              className="relative z-[2] flex w-[65%] flex-col justify-center self-stretch py-6 pl-4 pr-[14%] text-center"
              style={{
                clipPath: c2Blue,
                WebkitClipPath: c2Blue,
                marginRight: '-17%',
                background: 'linear-gradient(to bottom, #01017a 0%, #010158 60%, #000033 100%)',
              }}
            >
              <div className="mb-4">
                <span className="inline-block rounded-sm border border-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white">
                  Brandon Pfaadt
                </span>
              </div>
              <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-wide text-white">Allowed a SLG of</h2>
              <div className="my-2 text-[5.5rem] font-black leading-none tracking-tight text-white">.423</div>
              <p className="text-xs font-semibold uppercase leading-relaxed tracking-[0.15em] text-gray-300">
                On Low Non-Fastballs
                <br />
                This Season
              </p>
            </div>

            {/* Right - Player Image */}
            <div className="relative w-[52%] shrink-0">
              <img
                src="http://photos.iconsportswire.com/images/watermark/2024/09/24/dis240924008_sf_at_ari.jpg"
                alt="Brandon Pfaadt"
                className="h-full w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            <div
              className="pointer-events-none absolute inset-0 z-[3]"
              style={{ clipPath: c2TopWhite, background: 'white' }}
            />
          </div>

          <div className="relative flex shrink-0 flex-row">
            <div
              className="relative z-[2] flex w-[75%] items-center justify-center py-6 pl-[4%] pr-[20%]"
              style={{
                clipPath: c2Navy,
                WebkitClipPath: c2Navy,
                marginRight: '-27%',
                backgroundColor: '#000080',
              }}
            >
              <p className="text-lg font-extrabold uppercase tracking-wide text-white">8th Worst Among SPs</p>
            </div>
            <div className="flex w-[52%] shrink-0 items-center justify-center gap-2 bg-[#0c0315] py-6 pl-[24%]">
              <div className="text-right">
                <span className="block text-[0.55rem] uppercase tracking-wider text-gray-400">Brought to you by</span>
                <span className="text-sm font-bold tracking-wider text-white">Inside Edge</span>
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 z-[3]"
              style={{ clipPath: c2BotWhite, background: 'white' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
