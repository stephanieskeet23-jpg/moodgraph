import React, { useState, useEffect, useCallback } from 'react';
import StickyNote from './StickyNote';
import CreateNoteModal from './CreateNoteModal';

const API_BASE = '/api';

export default function Board({
  boardId,
  notes,
  setNotes,
  onNoteCreated,
  onNoteUpdated,
  onNoteDeleted
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    if (!boardId) return;
    try {
      const response = await fetch(`${API_BASE}/boards/${boardId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  }, [boardId, setNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (noteData) => {
    try {
      const formData = new FormData();
      formData.append('title', noteData.title || '');
      formData.append('content', noteData.content || '');
      formData.append('color', noteData.color);
      formData.append('position_x', Math.random() * 300);
      formData.append('position_y', Math.random() * 300);

      if (noteData.imageFile) {
        formData.append('image', noteData.imageFile);
      } else if (noteData.imageUrl) {
        formData.append('image_url', noteData.imageUrl);
      }

      const response = await fetch(`${API_BASE}/boards/${boardId}/notes`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [newNote, ...prev]);
        onNoteCreated(newNote);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const formData = new FormData();
      formData.append('title', noteData.title || '');
      formData.append('content', noteData.content || '');
      formData.append('color', noteData.color);
      formData.append('position_x', noteData.position_x ?? editingNote?.position_x ?? 0);
      formData.append('position_y', noteData.position_y ?? editingNote?.position_y ?? 0);

      if (noteData.imageFile) {
        formData.append('image', noteData.imageFile);
      } else if (noteData.imageUrl !== undefined) {
        formData.append('image_url', noteData.imageUrl || '');
      }

      const response = await fetch(`${API_BASE}/notes/${noteData.id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
        onNoteUpdated(updatedNote);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handlePositionUpdate = async (note) => {
    try {
      const response = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_x: note.position_x,
          position_y: note.position_y
        })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
        onNoteUpdated(updatedNote);
      }
    } catch (error) {
      console.error('Failed to update note position:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        onNoteDeleted(noteId, boardId);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleGenerateImage = async (prompt) => {
    try {
      const response = await fetch(`${API_BASE}/images/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.success) {
        return data.imageUrl;
      } else {
        console.error('Image generation failed:', data.error);
        alert(data.error || 'Failed to generate image');
        return null;
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Failed to generate image. Please check your API key.');
      return null;
    }
  };

  const handleGenerateText = async (prompt) => {
    try {
      const response = await fetch(`${API_BASE}/text/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.success) {
        return data.text;
      } else {
        console.error('Text generation failed:', data.error);
        alert(data.error || 'Failed to generate text');
        return null;
      }
    } catch (error) {
      console.error('Text generation error:', error);
      alert('Failed to generate text. Please check your API key.');
      return null;
    }
  };

  const handleSave = async (noteData) => {
    if (editingNote) {
      await handleUpdateNote(noteData);
    } else {
      await handleCreateNote(noteData);
    }
    setEditingNote(null);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  if (!boardId) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
        <div className="text-center max-w-sm px-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#F5F2ED' }}
          >
            <svg className="w-8 h-8" style={{ color: '#78716C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: '#44403C' }}
          >
            Select a collection
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
            Choose a board from the sidebar or create a new one to begin curating your ideas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-auto" style={{ backgroundColor: '#FAF8F5' }}>
      {/* Board canvas */}
      <div className="board-container relative min-h-full p-6" style={{ minWidth: '100%', minHeight: 'calc(100vh - 64px)' }}>
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: '#F5F2ED' }}
              >
                <svg className="w-10 h-10" style={{ color: '#A8A29E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3
                className="text-xl font-medium mb-2"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: '#57534E' }}
              >
                Begin your collection
              </h3>
              <p className="text-sm" style={{ color: '#78716C' }}>
                Add your first note to start curating
              </p>
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={handlePositionUpdate}
              onDelete={handleDeleteNote}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Floating Action Button - refined */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fab fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-elevated flex items-center justify-center z-40 transition-all"
        style={{ backgroundColor: '#7A3F3B', color: '#FAF8F5' }}
        aria-label="Add note"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Create/Edit Modal */}
      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onGenerateImage={handleGenerateImage}
        onGenerateText={handleGenerateText}
        editingNote={editingNote}
      />
    </div>
  );
}
