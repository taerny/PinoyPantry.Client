export function StatsComparePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-2 sm:p-4 md:p-8">
      <div className="flex relative w-full max-w-6xl h-[300px] sm:h-[400px] md:h-[600px] shadow-2xl rounded-lg overflow-hidden">
        {/* Left Side - Buffalo Bills */}
        <div className="flex-1 bg-[#00338D] flex items-center justify-center p-2 sm:p-4 md:p-6 relative">
          <div className="bg-[#002366]/60 rounded-xl md:rounded-2xl px-2 sm:px-3 md:px-4 py-2 sm:py-3 pt-10 sm:pt-14 md:pt-20 w-full h-[180px] sm:h-[250px] md:h-[350px] max-w-[200px] sm:max-w-xs flex flex-col justify-center text-center relative">
          {/* Logo - Positioned on top of the border */}
          <div className="absolute -top-6 sm:-top-8 md:-top-14 left-1/2 -translate-x-1/2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/2560px-Buffalo_Bills_logo.svg.png" 
              alt="Buffalo Bills Logo" 
              className="h-12 sm:h-16 md:h-28 w-auto"
            />
          </div>
          
          {/* Team Name */}
          <h2 className="text-[#E31837] font-bold text-[10px] sm:text-xs md:text-base tracking-wider mb-0.5 sm:mb-1">
            BUFFALO BILLS
          </h2>
          
          {/* Main Stat */}
          <div className="text-white mb-0.5 sm:mb-1">
            <p className="text-xs sm:text-base md:text-2xl font-bold leading-tight">
              75.0% COMPLETION<br />
              RATE ON PLAY<br />
              ACTION PASSES
            </p>
          </div>
          
          {/* Subtitle */}
          <p className="text-white/80 text-[8px] sm:text-[10px] md:text-xs tracking-wider">
            2ND BEST IN NFL THIS SEASON
          </p>
        </div>
        </div>

        {/* VS Circle - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center border-2 sm:border-3 md:border-4 border-[#E65100] shadow-lg">
            <span className="text-[#1a1a2e] font-bold text-sm sm:text-lg md:text-2xl">vs</span>
          </div>
        </div>

        {/* Right Side - Miami Dolphins */}
        <div className="flex-1 bg-[#008E97] flex items-center justify-center p-2 sm:p-4 md:p-6 relative">
          {/* Brought to you by - Top right corner */}
          <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-4 md:right-6 text-right text-white/90 text-[8px] sm:text-[10px] md:text-xs z-10">
            <p className="tracking-wider font-bold">BROUGHT TO YOU BY</p>
            <p className="font-bold text-[10px] sm:text-xs md:text-sm mt-0.5">
              <span className="text-[#E65100]">■</span> Inside Edge
            </p>
          </div>

        <div className="bg-[#006D75]/60 rounded-xl md:rounded-2xl px-2 sm:px-3 md:px-4 py-2 sm:py-3 pt-10 sm:pt-14 md:pt-20 w-full h-[180px] sm:h-[250px] md:h-[350px] max-w-[200px] sm:max-w-xs flex flex-col justify-center text-center relative">
          {/* Logo - Positioned on top of the border */}
          <div className="absolute -top-6 sm:-top-8 md:-top-14 left-1/2 -translate-x-1/2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Miami_Dolphins_logo.svg/1280px-Miami_Dolphins_logo.svg.png" 
              alt="Miami Dolphins Logo" 
              className="h-12 sm:h-16 md:h-28 w-auto"
            />
          </div>
          
          {/* Team Name */}
          <h2 className="text-[#E65100] font-bold text-[10px] sm:text-xs md:text-base tracking-wider mb-0.5 sm:mb-1">
            MIAMI DOLPHINS
          </h2>
          
          {/* Main Stat */}
          <div className="text-white mb-0.5 sm:mb-1">
            <p className="text-xs sm:text-base md:text-2xl font-bold leading-tight">
              75.8% COMPLETION<br />
              RATE ALLOWED ON<br />
              PLAY ACTION PASSES
            </p>
          </div>
          
          {/* Subtitle */}
          <p className="text-white/80 text-[8px] sm:text-[10px] md:text-xs tracking-wider">
            4TH WORST IN NFL THIS SEASON
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
