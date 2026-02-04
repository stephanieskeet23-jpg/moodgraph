import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// In production, connect to same origin; in dev, use localhost:3001
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';

export function useSocket(boardId, handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (boardId) {
        socket.emit('join-board', boardId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Set up event handlers
    if (handlers.onNoteCreated) {
      socket.on('note-created', handlers.onNoteCreated);
    }
    if (handlers.onNoteUpdated) {
      socket.on('note-updated', handlers.onNoteUpdated);
    }
    if (handlers.onNoteDeleted) {
      socket.on('note-deleted', handlers.onNoteDeleted);
    }
    if (handlers.onBoardCreated) {
      socket.on('board-created', handlers.onBoardCreated);
    }
    if (handlers.onBoardUpdated) {
      socket.on('board-updated', handlers.onBoardUpdated);
    }
    if (handlers.onBoardDeleted) {
      socket.on('board-deleted', handlers.onBoardDeleted);
    }

    return () => {
      if (boardId) {
        socket.emit('leave-board', boardId);
      }
      socket.disconnect();
    };
  }, [boardId]);

  // Update handlers when they change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove old handlers and add new ones
    socket.off('note-created');
    socket.off('note-updated');
    socket.off('note-deleted');
    socket.off('board-created');
    socket.off('board-updated');
    socket.off('board-deleted');

    if (handlers.onNoteCreated) {
      socket.on('note-created', handlers.onNoteCreated);
    }
    if (handlers.onNoteUpdated) {
      socket.on('note-updated', handlers.onNoteUpdated);
    }
    if (handlers.onNoteDeleted) {
      socket.on('note-deleted', handlers.onNoteDeleted);
    }
    if (handlers.onBoardCreated) {
      socket.on('board-created', handlers.onBoardCreated);
    }
    if (handlers.onBoardUpdated) {
      socket.on('board-updated', handlers.onBoardUpdated);
    }
    if (handlers.onBoardDeleted) {
      socket.on('board-deleted', handlers.onBoardDeleted);
    }
  }, [handlers]);

  // Join board when boardId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.connected && boardId) {
      socket.emit('join-board', boardId);
    }
  }, [boardId]);

  const emitNoteCreated = useCallback((note) => {
    socketRef.current?.emit('note-created', note);
  }, []);

  const emitNoteUpdated = useCallback((note) => {
    socketRef.current?.emit('note-updated', note);
  }, []);

  const emitNoteDeleted = useCallback((noteId, boardId) => {
    socketRef.current?.emit('note-deleted', { noteId, boardId });
  }, []);

  const emitBoardCreated = useCallback((board) => {
    socketRef.current?.emit('board-created', board);
  }, []);

  const emitBoardUpdated = useCallback((board) => {
    socketRef.current?.emit('board-updated', board);
  }, []);

  const emitBoardDeleted = useCallback((boardId) => {
    socketRef.current?.emit('board-deleted', { boardId });
  }, []);

  return {
    emitNoteCreated,
    emitNoteUpdated,
    emitNoteDeleted,
    emitBoardCreated,
    emitBoardUpdated,
    emitBoardDeleted
  };
}
