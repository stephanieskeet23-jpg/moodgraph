import React, { useState, useEffect, useRef } from 'react';

// Japandi-inspired color palette
const COLORS = [
  { value: '#F5F2ED', name: 'Ivory' },
  { value: '#E8B09A', name: 'Terracotta' },
  { value: '#D4DAC9', name: 'Sage' },
  { value: '#D6E4E8', name: 'Slate' },
  { value: '#E2DDD8', name: 'Stone' },
  { value: '#E9B88A', name: 'Cognac' },
  { value: '#E8D4D4', name: 'Rose' },
  { value: '#EBE6DE', name: 'Warm Gray' },
];

export default function CreateNoteModal({
  isOpen,
  onClose,
  onSave,
  onGenerateImage,
  onGenerateText,
  editingNote = null
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [content]);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setColor(editingNote.color || COLORS[0].value);
      setImageUrl(editingNote.image_url || '');
      setImagePreview(editingNote.image_url || '');
    } else {
      setTitle('');
      setContent('');
      setColor(COLORS[0].value);
      setImageUrl('');
      setImagePreview('');
    }
    setImageFile(null);
    setImagePrompt('');
    setTextPrompt('');
  }, [editingNote, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const generatedUrl = await onGenerateImage(imagePrompt);
      if (generatedUrl) {
        setImageUrl(generatedUrl);
        setImagePreview(generatedUrl);
        setImageFile(null);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateText = async () => {
    if (!textPrompt.trim()) return;
    setIsGeneratingText(true);
    try {
      const generatedText = await onGenerateText(textPrompt);
      if (generatedText) {
        setContent(prev => prev ? prev + '\n\n' + generatedText : generatedText);
      }
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateBoth = async () => {
    if (!textPrompt.trim() && !imagePrompt.trim()) return;

    const promises = [];

    if (textPrompt.trim()) {
      setIsGeneratingText(true);
      promises.push(
        onGenerateText(textPrompt)
          .then(text => { if (text) setContent(prev => prev ? prev + '\n\n' + text : text); })
          .finally(() => setIsGeneratingText(false))
      );
    }

    if (imagePrompt.trim()) {
      setIsGeneratingImage(true);
      promises.push(
        onGenerateImage(imagePrompt)
          .then(url => {
            if (url) {
              setImageUrl(url);
              setImagePreview(url);
              setImageFile(null);
            }
          })
          .finally(() => setIsGeneratingImage(false))
      );
    }

    await Promise.all(promises);
  };

  const handleClearImage = () => {
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      content,
      color,
      imageFile,
      imageUrl: imageFile ? null : imageUrl,
      ...(editingNote ? { id: editingNote.id, board_id: editingNote.board_id } : {})
    });
    onClose();
  };

  const isGenerating = isGeneratingImage || isGeneratingText;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
        style={{ backgroundColor: '#FDFCFA' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 border-b px-6 py-5 flex items-center justify-between rounded-t-2xl z-10"
          style={{ backgroundColor: '#FDFCFA', borderColor: 'rgba(214, 211, 209, 0.3)' }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: '#1C1917' }}
          >
            {editingNote ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: '#57534E' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E7E5E4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Color picker */}
          <div>
            <label
              className="block text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: '#57534E' }}
            >
              Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`color-btn w-9 h-9 rounded-full ${color === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* INPUT SECTION */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: '#F8F7F5', border: '1px solid rgba(214, 211, 209, 0.4)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" style={{ color: '#78716C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#78716C' }}
              >
                Input
              </span>
            </div>

            {/* Title */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: '#57534E' }}
              >
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title..."
                className="w-full px-4 py-2.5 rounded-xl input-field text-sm font-medium"
                style={{ color: '#44403C' }}
              />
            </div>

            {/* Notes */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: '#57534E' }}
              >
                Notes
              </label>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  autoResizeTextarea();
                }}
                placeholder="Add your notes here..."
                className="w-full px-4 py-3 rounded-xl input-field resize-none text-sm leading-relaxed overflow-hidden"
                style={{ color: '#44403C', minHeight: '80px' }}
              />
            </div>

            {/* Upload Image */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: '#57534E' }}
              >
                Upload Image
              </label>

              {/* Image preview */}
              {imagePreview && (
                <div
                  className="relative mb-3 rounded-xl overflow-hidden"
                  style={{ backgroundColor: '#E7E5E4' }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'rgba(28, 25, 23, 0.8)', color: '#FAF8F5' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed rounded-xl text-center cursor-pointer transition-colors text-sm"
                style={{ borderColor: 'rgba(168, 162, 158, 0.6)', color: '#57534E', backgroundColor: '#FDFCFA' }}
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Choose file...
              </label>
            </div>
          </div>

          {/* GENERATE SECTION */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: '#F0EEF5', border: '1px solid rgba(91, 75, 138, 0.15)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" style={{ color: '#5B4B8A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#5B4B8A' }}
              >
                AI Generate
              </span>
            </div>

            {/* Generate Text */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: '#5B4B8A' }}
              >
                Generate Text
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="e.g., 'Write a pasta recipe'"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: '#FDFCFA', border: '1px solid rgba(91, 75, 138, 0.2)', color: '#44403C' }}
                />
                <button
                  type="button"
                  onClick={handleGenerateText}
                  disabled={isGeneratingText || !textPrompt.trim()}
                  className="px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center gap-2"
                  style={{ backgroundColor: '#5B4B8A', color: '#FDFCFA' }}
                  title="Generate text"
                >
                  {isGeneratingText ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Generate Image */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: '#5B4B8A' }}
              >
                Generate Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g., 'A cozy Italian kitchen'"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: '#FDFCFA', border: '1px solid rgba(91, 75, 138, 0.2)', color: '#44403C' }}
                />
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center gap-2"
                  style={{ backgroundColor: '#854D26', color: '#FDFCFA' }}
                  title="Generate image"
                >
                  {isGeneratingImage ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Generate Both Button */}
            {(textPrompt.trim() && imagePrompt.trim()) && (
              <button
                type="button"
                onClick={handleGenerateBoth}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#5B4B8A', color: '#FDFCFA' }}
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Both
                  </>
                )}
              </button>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#7A3F3B', color: '#FAF8F5' }}
          >
            {editingNote ? 'Save Changes' : 'Add Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
