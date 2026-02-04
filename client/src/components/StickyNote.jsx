import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';

export default function StickyNote({
  note,
  onUpdate,
  onDelete,
  onEdit
}) {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = (e, data) => {
    dragStartPos.current = { x: data.x, y: data.y };
    setIsDragging(true);
  };

  const handleDragStop = (e, data) => {
    setIsDragging(false);
    // Only update if position changed
    if (data.x !== dragStartPos.current.x || data.y !== dragStartPos.current.y) {
      onUpdate({
        ...note,
        position_x: data.x,
        position_y: data.y
      });
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: note.position_x || 0, y: note.position_y || 0 }}
      onStart={handleDragStart}
      onStop={handleDragStop}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className={`sticky-note absolute rounded-lg overflow-hidden cursor-move ${isDragging ? 'dragging' : ''}`}
        style={{
          backgroundColor: note.color || '#fef08a',
          width: note.width || 200,
          minHeight: note.height || 200,
        }}
      >
        {/* Drag handle */}
        <div className="drag-handle h-6 bg-black/5 flex items-center justify-center cursor-grab active:cursor-grabbing">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-black/20"></div>
            <div className="w-1 h-1 rounded-full bg-black/20"></div>
            <div className="w-1 h-1 rounded-full bg-black/20"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Image */}
          {note.image_url && (
            <div className="mb-2 rounded overflow-hidden">
              <img
                src={note.image_url}
                alt=""
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Text content */}
          {note.content && (
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {note.content}
            </p>
          )}

          {/* Empty state */}
          {!note.content && !note.image_url && (
            <p className="text-sm text-gray-400 italic">Empty note</p>
          )}
        </div>

        {/* Actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-1.5 rounded bg-white/80 hover:bg-white text-gray-600 hover:text-purple-600 transition-colors"
            title="Edit note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this note?')) {
                onDelete(note.id);
              }
            }}
            className="p-1.5 rounded bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 transition-colors"
            title="Delete note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Draggable>
  );
}
