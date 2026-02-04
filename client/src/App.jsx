import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import BoardList from './components/BoardList';
import Board from './components/Board';
import { useSocket } from './hooks/useSocket';

const API_BASE = '/api';

function App() {
  const [boards, setBoards] = useState([]);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Memoize handlers to prevent useSocket from reconnecting
  const socketHandlers = useMemo(() => ({
    onNoteCreated: (note) => {
      if (note.board_id === currentBoardId) {
        setNotes(prev => {
          if (prev.find(n => n.id === note.id)) return prev;
          return [note, ...prev];
        });
      }
    },
    onNoteUpdated: (note) => {
      if (note.board_id === currentBoardId) {
        setNotes(prev => prev.map(n => n.id === note.id ? note : n));
      }
    },
    onNoteDeleted: (data) => {
      setNotes(prev => prev.filter(n => n.id !== data.noteId));
    },
    onBoardCreated: (board) => {
      setBoards(prev => {
        if (prev.find(b => b.id === board.id)) return prev;
        return [board, ...prev];
      });
    },
    onBoardUpdated: (board) => {
      setBoards(prev => prev.map(b => b.id === board.id ? board : b));
    },
    onBoardDeleted: (data) => {
      setBoards(prev => prev.filter(b => b.id !== data.boardId));
      if (currentBoardId === data.boardId) {
        setCurrentBoardId(null);
        setNotes([]);
      }
    }
  }), [currentBoardId]);

  const {
    emitNoteCreated,
    emitNoteUpdated,
    emitNoteDeleted,
    emitBoardCreated,
    emitBoardUpdated,
    emitBoardDeleted
  } = useSocket(currentBoardId, socketHandlers);

  // Fetch boards on mount
  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch(`${API_BASE}/boards`);
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
        // Auto-select first board if none selected
        if (data.length > 0 && !currentBoardId) {
          setCurrentBoardId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const handleCreateBoard = async (name, category) => {
    try {
      const response = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category })
      });

      if (response.ok) {
        const board = await response.json();
        setBoards(prev => [board, ...prev]);
        setCurrentBoardId(board.id);
        setNotes([]);
        emitBoardCreated(board);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      const response = await fetch(`${API_BASE}/boards/${boardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBoards(prev => prev.filter(b => b.id !== boardId));
        emitBoardDeleted(boardId);

        if (currentBoardId === boardId) {
          const remaining = boards.filter(b => b.id !== boardId);
          setCurrentBoardId(remaining.length > 0 ? remaining[0].id : null);
          setNotes([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const handleSelectBoard = (boardId) => {
    setCurrentBoardId(boardId);
    setNotes([]);
  };

  const currentBoard = boards.find(b => b.id === currentBoardId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentBoard={currentBoard}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex">
        <BoardList
          boards={boards}
          currentBoardId={currentBoardId}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <Board
          boardId={currentBoardId}
          notes={notes}
          setNotes={setNotes}
          onNoteCreated={emitNoteCreated}
          onNoteUpdated={emitNoteUpdated}
          onNoteDeleted={emitNoteDeleted}
        />
      </div>
    </div>
  );
}

export default App;
