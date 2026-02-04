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
          className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
          style={{ backgroundColor: 'rgba(12, 10, 9, 0.3)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 border-r
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col h-screen md:h-auto
        `}
        style={{
          backgroundColor: '#FDFCFA',
          borderColor: 'rgba(214, 211, 209, 0.4)'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b"
          style={{ borderColor: 'rgba(214, 211, 209, 0.4)' }}
        >
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: '#1C1917' }}
            >
              Collections
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>{boards.length} boards</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#7A3F3B', color: '#FAF8F5' }}
            title="Create new board"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Create board form */}
        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="p-5 border-b"
            style={{ backgroundColor: 'rgba(245, 242, 237, 0.5)', borderColor: 'rgba(214, 211, 209, 0.4)' }}
          >
            <input
              type="text"
              placeholder="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium input-field"
              autoFocus
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newBoardCategory}
              onChange={(e) => setNewBoardCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm mt-2.5 input-field"
            />
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: '#7A3F3B', color: '#FAF8F5' }}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ backgroundColor: '#F5F2ED', color: '#292524' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Board list */}
        <div className="flex-1 overflow-y-auto p-3">
          {boards.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F5F2ED' }}
              >
                <svg className="w-6 h-6" style={{ color: '#78716C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: '#57534E' }}>No boards yet</p>
              <p className="text-xs mt-1" style={{ color: '#78716C' }}>Create one to get started</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {boards.map((board, index) => (
                <li key={board.id} className="stagger-item">
                  <button
                    onClick={() => {
                      onSelectBoard(board.id);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group"
                    style={{
                      backgroundColor: currentBoardId === board.id ? '#7A3F3B' : 'transparent',
                      color: currentBoardId === board.id ? '#FAF8F5' : '#44403C'
                    }}
                    onMouseEnter={(e) => {
                      if (currentBoardId !== board.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(245, 242, 237, 0.7)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentBoardId !== board.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {board.name}
                      </p>
                      {board.category && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: currentBoardId === board.id ? 'rgba(250, 248, 245, 0.7)' : '#78716C' }}
                        >
                          {board.category}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, board.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{
                        color: currentBoardId === board.id ? 'rgba(250, 248, 245, 0.8)' : '#BF6D4D'
                      }}
                      title="Delete board"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(214, 211, 209, 0.4)' }}>
          <p className="text-xs text-center" style={{ color: '#78716C' }}>
            Crafted with intention
          </p>
        </div>
      </aside>
    </>
  );
}
