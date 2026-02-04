import React, { useState } from 'react';

export default function BoardList({
  boards,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  isOpen,
  onClose
}) {
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardCategory, setNewBoardCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    await onCreateBoard(newBoardName.trim(), newBoardCategory.trim() || 'general');
    setNewBoardName('');
    setNewBoardCategory('');
    setIsCreating(false);
  };

  const handleDelete = (e, boardId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this board? All notes will be lost.')) {
      onDeleteBoard(boardId);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-white shadow-xl md:shadow-md
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen md:h-auto
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">My Boards</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
            title="Create new board"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Create board form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 bg-purple-50 border-b border-purple-100">
            <input
              type="text"
              placeholder="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
              autoFocus
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newBoardCategory}
              onChange={(e) => setNewBoardCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Board list */}
        <div className="flex-1 overflow-y-auto p-2">
          {boards.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No boards yet. Create one to get started!
            </p>
          ) : (
            <ul className="space-y-1">
              {boards.map((board) => (
                <li key={board.id}>
                  <button
                    onClick={() => {
                      onSelectBoard(board.id);
                      onClose();
                    }}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg transition-all
                      flex items-center justify-between group
                      ${currentBoardId === board.id
                        ? 'bg-purple-100 text-purple-800'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{board.name}</p>
                      {board.category && (
                        <p className="text-xs text-gray-500 mt-0.5">{board.category}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, board.id)}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 transition-all"
                      title="Delete board"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
