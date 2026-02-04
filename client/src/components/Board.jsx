import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const handleGenerateImage = async () => {
    // Generate a random placeholder image
    const width = 400;
    const height = 300;
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/${width}/${height}`;
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <p className="text-lg font-medium">Select a board to get started</p>
          <p className="text-sm">Create a new board or select one from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-auto">
      {/* Board canvas */}
      <div className="board-container relative min-h-full p-4" style={{ minWidth: '100%', minHeight: 'calc(100vh - 64px)' }}>
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No notes yet</p>
              <p className="text-sm">Click the + button to add your first note</p>
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

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fab fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl z-40"
        aria-label="Add note"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Create/Edit Modal */}
      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onGenerateImage={handleGenerateImage}
        editingNote={editingNote}
      />
    </div>
  );
}
