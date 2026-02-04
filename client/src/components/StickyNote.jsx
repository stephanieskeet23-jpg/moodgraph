import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import ReactMarkdown from 'react-markdown';

// Japandi-inspired muted color mapping
const colorMap = {
  '#fef08a': '#F5F2ED', // Warm ivory
  '#fecaca': '#E8B09A', // Muted terracotta
  '#bbf7d0': '#D4DAC9', // Sage green
  '#bfdbfe': '#D6E4E8', // Slate blue
  '#ddd6fe': '#E2DDD8', // Warm stone
  '#fed7aa': '#E9B88A', // Cognac
  '#fbcfe8': '#E8D4D4', // Dusty rose
  '#e5e7eb': '#EBE6DE', // Warm gray
};


export default function StickyNote({
  note,
  onUpdate,
  onDelete,
  onEdit
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const nodeRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const clickStart = useRef({ time: 0, x: 0, y: 0 });

  const handleDragStart = (e, data) => {
    dragStartPos.current = { x: data.x, y: data.y };
    clickStart.current = { time: Date.now(), x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleDragStop = (e, data) => {
    setIsDragging(false);

    // Check if it was a click (minimal movement and short duration)
    const timeDiff = Date.now() - clickStart.current.time;
    const moveX = Math.abs(data.x - dragStartPos.current.x);
    const moveY = Math.abs(data.y - dragStartPos.current.y);

    if (timeDiff < 200 && moveX < 5 && moveY < 5) {
      // It was a click, toggle expanded state
      setIsExpanded(!isExpanded);
      return;
    }

    // It was a drag, update position
    if (data.x !== dragStartPos.current.x || data.y !== dragStartPos.current.y) {
      onUpdate({
        ...note,
        position_x: data.x,
        position_y: data.y
      });
    }
  };

  // Map original colors to Japandi palette
  const noteColor = colorMap[note.color] || note.color || '#F5F2ED';

  // Determine width based on expanded state
  const collapsedWidth = 220;
  const expandedWidth = note.image_url ? 360 : 320;
  const currentWidth = isExpanded ? expandedWidth : collapsedWidth;

  // Check if content needs expansion
  const hasMoreContent = note.content && note.content.length > 80;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: note.position_x || 0, y: note.position_y || 0 }}
      onStart={handleDragStart}
      onStop={handleDragStop}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={`sticky-note absolute rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ease-out ${isDragging ? 'dragging cursor-grabbing' : ''}`}
        style={{
          backgroundColor: noteColor,
          width: currentWidth,
          maxWidth: 400,
        }}
      >
        {/* Top accent */}
        <div className="h-5 flex items-center justify-center bg-charcoal-900/[0.03]">
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-charcoal-400/20"></div>
            <div className="w-1 h-1 rounded-full bg-charcoal-400/20"></div>
            <div className="w-1 h-1 rounded-full bg-charcoal-400/20"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-12">
          {/* Title */}
          {note.title && (
            <h3
              className={`font-semibold text-charcoal-800 leading-tight ${isExpanded ? 'text-lg mb-2' : 'text-base mb-1'}`}
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              {note.title}
            </h3>
          )}

          {/* Image */}
          {note.image_url && (
            <div className={`rounded-lg overflow-hidden bg-charcoal-100 ${isExpanded ? 'mb-3' : 'mb-2'}`}>
              <img
                src={note.image_url}
                alt=""
                className="w-full h-auto object-cover"
                style={{ maxHeight: isExpanded ? 'none' : '120px' }}
                loading="lazy"
              />
            </div>
          )}

          {/* Text content */}
          {note.content && (
            <div className="relative">
              <div
                className={`markdown-content text-sm leading-relaxed overflow-hidden ${isExpanded ? 'text-charcoal-700' : 'text-charcoal-600'}`}
                style={isExpanded ? {} : { maxHeight: '4.5em' }}
              >
                <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className={`font-bold ${isExpanded ? 'text-base mb-2 mt-3 first:mt-0' : 'text-sm mb-1'}`}>{children}</h1>,
                  h2: ({ children }) => <h2 className={`font-bold ${isExpanded ? 'text-sm mb-2 mt-3 first:mt-0' : 'text-sm mb-1'}`}>{children}</h2>,
                  h3: ({ children }) => <h3 className={`font-semibold ${isExpanded ? 'text-sm mb-1 mt-2 first:mt-0' : 'text-sm mb-0.5'}`}>{children}</h3>,
                  p: ({ children }) => <p className={isExpanded ? 'mb-2 last:mb-0' : 'mb-1 last:mb-0'}>{children}</p>,
                  ul: ({ children }) => <ul className={`list-disc list-inside ${isExpanded ? 'mb-2 space-y-0.5' : 'mb-1'}`}>{children}</ul>,
                  ol: ({ children }) => <ol className={`list-decimal list-inside ${isExpanded ? 'mb-2 space-y-0.5' : 'mb-1'}`}>{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-charcoal-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                  blockquote: ({ children }) => <blockquote className={`border-l-2 border-charcoal-300 pl-3 italic text-charcoal-600 ${isExpanded ? 'my-2' : 'my-1'}`}>{children}</blockquote>,
                  hr: () => <hr className={`border-charcoal-200 ${isExpanded ? 'my-3' : 'my-1'}`} />,
                }}
              >
                {note.content}
              </ReactMarkdown>
              </div>
              {/* Fade-out gradient for collapsed state */}
              {!isExpanded && hasMoreContent && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${noteColor})`
                  }}
                />
              )}
            </div>
          )}

          {/* Empty state */}
          {!note.content && !note.image_url && !note.title && (
            <p className="text-sm text-charcoal-400 italic">Empty note</p>
          )}

          {/* Expand indicator */}
          {!isExpanded && (hasMoreContent || note.image_url) && (
            <div className="mt-2 text-xs text-charcoal-400 flex items-center gap-1">
              <span>Click to expand</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {/* Collapse indicator */}
          {isExpanded && (
            <div className="mt-3 text-xs text-charcoal-400 flex items-center gap-1">
              <span>Click to collapse</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Actions - always visible */}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-2 rounded-lg bg-ivory-50/90 hover:bg-ivory-100 text-charcoal-500 hover:text-[#7A3F3B] transition-all shadow-soft"
            title="Edit note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this note?')) {
                onDelete(note.id);
              }
            }}
            className="p-2 rounded-lg bg-ivory-50/90 hover:bg-terracotta-50 text-charcoal-500 hover:text-terracotta-600 transition-all shadow-soft"
            title="Delete note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Draggable>
  );
}
