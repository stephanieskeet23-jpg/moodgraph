import React from 'react';

export default function Header({ currentBoard, onMenuClick }) {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
              <path d="M8 12a4 4 0 108 0 4 4 0 00-8 0z" fill="white" />
              <circle cx="7" cy="7" r="2" fill="#fbbf24" />
              <circle cx="17" cy="7" r="2" fill="#34d399" />
              <circle cx="17" cy="17" r="2" fill="#f472b6" />
              <circle cx="7" cy="17" r="2" fill="#60a5fa" />
            </svg>
            <h1 className="text-xl font-bold">MoodGraph</h1>
          </div>
        </div>

        {currentBoard && (
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium truncate max-w-[200px]">
              {currentBoard.name}
            </span>
            {currentBoard.category && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {currentBoard.category}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70 hidden sm:inline">Real-time sync enabled</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected"></div>
        </div>
      </div>
    </header>
  );
}
