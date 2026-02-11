export function HomeRunsPage() {
  const players = [
    {
      name: "CAL RALEIGH",
      team: "Mariners",
      teamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Seattle_Mariners_logo_%28low_res%29.svg/1200px-Seattle_Mariners_logo_%28low_res%29.svg.png",
      rank: "#29",
      homeruns: 60,
      bgColor: "bg-[#0C5C56]",
      accentColor: "bg-[#034141]",
      imageUrl: "https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/41292.png&w=350&h=254"
    },
    {
      name: "KYLE SCHWARBER",
      team: "Phillies",
      teamLogo: "https://www.vhv.rs/dpng/d/457-4571613_philadelphia-phillies-logo-png-mlb-philadelphia-phillies-logo.png",
      rank: "#12",
      homeruns: 56,
      bgColor: "bg-[#E81828]",
      accentColor: "bg-[#C8102E]",
      imageUrl: "https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33712.png&w=350&h=254"
    },
    {
      name: "SHOHEI OHTANI",
      team: "Dodgers",
      teamLogo: "https://www.clipartmax.com/png/middle/164-1642834_la-dodgers-logo-vector.png",
      rank: "#17",
      homeruns: 55,
      bgColor: "bg-[#005A9C]",
      accentColor: "bg-[#004A8C]",
      imageUrl: "https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/39832.png&w=350&h=254"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00205B] p-4 md:p-8">
        
      <div className="w-full max-w-6xl">
        {/* Title */}
        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold text-center mb-6 md:mb-12 tracking-tight">
          MOST HOME RUNS THIS SEASON
        </h1>

        {/* Player Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 md:mb-12">
          {players.map((player, index) => (
            <div key={index} className="flex flex-col rounded-2xl overflow-hidden shadow-2xl">
              {/* Card Top - Team colored */}
              <div className={`${player.bgColor} pt-6 pb-24 px-6 relative`}>
                {/* Team Logo */}
                <div className="absolute top-4 left-4">
                  <img 
                    src={player.teamLogo} 
                    alt={`${player.team} Logo`}
                    className="h-12 md:h-16 w-auto"
                  />
                </div>
                
                {/* Rank */}
                <div className="absolute top-4 right-4">
                  <span className="text-white/40 text-3xl md:text-4xl font-bold">
                    {player.rank}
                  </span>
                </div>

                {/* Player Image - Full upper body with slight fade */}
                <div className="mt-8 flex justify-center relative">
                  <div className="relative">
                    <img 
                      src={player.imageUrl}
                      alt={player.name}
                      className="h-40 md:h-48 w-auto object-contain"
                    />
                    {/* Optional subtle bottom fade */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.25)]" />
                  </div>
                </div>

                {/* Player Name */}
                <h2 className="text-white text-lg md:text-xl font-bold text-center mt-4 tracking-wide">
                  {player.name}
                </h2>
              </div>

              {/* Card Bottom - Accent colored */}
              <div className={`${player.accentColor} py-6 flex justify-center relative`}>
                {/* Home Run Count Circle */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center border-4 border-[#00205B] shadow-lg">
                    <span className="text-[#00205B] font-bold text-2xl md:text-3xl">
                      {player.homeruns}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Branding */}
        <div className="text-center text-white/80 text-xs md:text-sm">
          <p className="tracking-wider font-bold">BROUGHT TO YOU BY</p>
          <p className="font-bold text-sm md:text-base mt-1">
            <span className="text-[#E65100]">■</span> Inside Edge
          </p>
        </div>
      </div>
    </div>
  );
}
