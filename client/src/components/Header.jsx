import React from 'react';

export default function Header({ currentBoard, onMenuClick }) {
  return (
    <header
      className="text-white sticky top-0 z-50 relative overflow-hidden"
      style={{ backgroundColor: '#7A3F3B' }}
    >
      {/* Leather texture layers */}

      {/* Base grain - fine noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Leather grain pattern - larger organic texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='leather'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.15' numOctaves='3' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23leather)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle horizontal grain lines - like real leather */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.15) 2px,
            rgba(0,0,0,0.15) 3px,
            transparent 3px,
            transparent 7px
          )`,
        }}
      />

      {/* Edge darkening - worn leather effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(0,0,0,0.08) 0%,
            transparent 30%,
            transparent 70%,
            rgba(0,0,0,0.12) 100%
          )`,
        }}
      />

      {/* Subtle inner glow at top */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.08) 50%, transparent 90%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: '#FAF8F5' }}
            >
              <svg className="w-5 h-5" style={{ color: '#7A3F3B' }} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L4 7v10l8 4 8-4V7l-8-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12L4 8m8 4v9m0-9l8-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="text-xl font-semibold tracking-tight drop-shadow-sm"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              MoodGraph
            </span>
          </div>
        </div>

        {/* Center - Board name */}
        {currentBoard && (
          <div className="hidden sm:flex items-center gap-3">
            <span
              className="text-lg font-medium drop-shadow-sm"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: '#FAF8F5' }}
            >
              {currentBoard.name}
            </span>
            {currentBoard.category && (
              <span
                className="text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm"
                style={{
                  color: 'rgba(250, 248, 245, 0.9)',
                  borderColor: 'rgba(250, 248, 245, 0.2)',
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
              >
                {currentBoard.category}
              </span>
            )}
          </div>
        )}

        {/* Right - Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs tracking-wide drop-shadow-sm" style={{ color: 'rgba(250, 248, 245, 0.8)' }}>Live</span>
            <div className="relative">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: '#E9B88A' }}></div>
              <div
                className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40"
                style={{ backgroundColor: '#E9B88A' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
