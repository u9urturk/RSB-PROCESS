import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';

export interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (notes: string[]) => void;
  suggestions?: string[];
  initialNote?: string[]; // when editing existing notes
  title?: string;
  addButtonLabel?: string;
  saveButtonLabel?: string;
  mode?: 'add' | 'edit';
}

// Reusable NoteModal (Stage 2)
const NoteModal: React.FC<NoteModalProps> = ({
  open,
  onClose,
  onSave,
  suggestions = [],
  initialNote, // keep possibly undefined to avoid new [] identity each render
  title = 'Not Ekle',
  addButtonLabel = 'Ekle',
  saveButtonLabel = 'Kaydet',
  mode = 'add'
}) => {
  const [note, setNote] = useState<string[]>(initialNote ?? []);
  const [input, setInput] = useState('');

  // Only reset when modal opens (transition from closed to open)
  useEffect(() => {
    if (open) {
      setNote(initialNote ?? []);
      setInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleAddTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    setNote(prev => (prev.includes(clean) ? prev : [...prev, clean]));
    setInput('');
  };

  const handleRemoveTag = (tag: string) => setNote(prev => prev.filter(t => t !== tag));

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        handleAddTag(input);
      }
    }
    if (e.key === 'Backspace' && !input && note.length > 0) {
      // Backspace boşken son etiketi silme kısayolu
      setNote(prev => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    onSave(note.filter(n => n.trim()));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-200 relative">
        <button
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors absolute top-4 right-4"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
            <Edit2 size={18} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {mode === 'edit' ? 'Notu Güncelle' : title}
          </h3>
        </div>

        {/* Existing tags */}
        {note.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.map((tag, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                {tag}
                <button
                  className="text-blue-500 hover:text-red-500 transition-colors"
                  onClick={() => handleRemoveTag(tag)}
                  type="button"
                  aria-label={`${tag} etiketini sil`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Not gir veya Enter ile etiketle..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
          <button
            type="button"
            disabled={!input.trim()}
            onClick={() => handleAddTag(input)}
            className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >Ekle</button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm text-gray-600 font-medium">Hızlı Seçenekler:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${note.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}`}
                  onClick={() => handleAddTag(s)}
                  type="button"
                  aria-pressed={note.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <button
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-semibold hover:bg-gray-200 transition-colors"
            onClick={onClose}
            type="button"
          >
            İptal
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
            onClick={handleSave}
            type="button"
          >
            {mode === 'edit' ? saveButtonLabel : addButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
