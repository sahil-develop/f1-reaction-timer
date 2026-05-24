'use client';

interface StartingLightsProps {
  litCount: number;
  lightsOut: boolean;
}

export function StartingLights({ litCount, lightsOut }: StartingLightsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Gantry bar */}
      <div className="w-full max-w-xs h-3 rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] border border-[#444]" />

      {/* Lights panel */}
      <div
        className="bg-[#111] border-2 border-[#2a2a2a] rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-4 shadow-2xl"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)' }}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const isLit = !lightsOut && i < litCount;
          return (
            <div
              key={i}
              className="relative flex items-center justify-center"
              aria-label={`Light ${i + 1} ${isLit ? 'on' : 'off'}`}
            >
              {/* Outer ring */}
              <div
                className={`
                  w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center
                  transition-all duration-150
                  ${isLit
                    ? 'border-[#FF0040] bg-[#E8002D]'
                    : 'border-[#2d0a0a] bg-[#120404]'
                  }
                `}
                style={isLit ? {
                  boxShadow: '0 0 20px 8px rgba(232,0,45,0.55), 0 0 60px 20px rgba(232,0,45,0.2)',
                } : {}}
              >
                {/* Inner highlight */}
                <div
                  className={`
                    w-4 h-4 sm:w-6 sm:h-6 rounded-full
                    transition-all duration-150
                    ${isLit ? 'bg-[#FF6680] opacity-70' : 'bg-[#1a0404] opacity-30'}
                  `}
                />
              </div>

              {/* Glow pulse when lit */}
              {isLit && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: '#E8002D' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom gantry bar */}
      <div className="w-full max-w-xs h-3 rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] border border-[#444]" />

      {/* Status label */}
      <div className="text-sm font-mono tracking-widest uppercase text-center min-h-[1.5rem]">
        {lightsOut ? (
          <span className="text-green-400 font-bold tracking-[0.3em]">GO GO GO</span>
        ) : litCount === 0 ? (
          <span className="text-zinc-600">STANDBY</span>
        ) : litCount < 5 ? (
          <span className="text-[#E8002D]">
            {litCount} / 5 LIGHTS
          </span>
        ) : (
          <span className="text-yellow-400 animate-pulse">GET READY...</span>
        )}
      </div>
    </div>
  );
}
