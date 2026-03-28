import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { matchSpokenItems, type MatchResult } from '../../lib/fuzzyMatch';
import type { PackingItem } from '../../db/models';

interface VoicePackButtonProps {
  items: PackingItem[];
  onPackItem: (id: string) => void;
  onUnpackItem: (id: string) => void;
  onHighlightItem?: (id: string) => void;
}

interface UndoToast {
  id: string;
  itemName: string;
  itemId: string;
  timerId: ReturnType<typeof setTimeout>;
}

export function VoicePackButton({ items, onPackItem, onUnpackItem, onHighlightItem }: VoicePackButtonProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const [results, setResults] = useState<MatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [undoToasts, setUndoToasts] = useState<UndoToast[]>([]);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const unpackedCount = items.filter(i => !i.isPacked).length;

  const handleToggle = useCallback(() => {
    if (isListening) {
      const finalTranscript = stopListening();
      const transcriptToUse = finalTranscript || (transcript + ' ' + interimTranscript).trim();
      if (!transcriptToUse.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }
      const matches = matchSpokenItems(transcriptToUse, items);
      setResults(matches);
      setShowResults(true);

      for (const match of matches) {
        if (match.item) {
          onPackItem(match.item.id);
          onHighlightItem?.(match.item.id);

          if (match.isAmbiguous) {
            const toastId = crypto.randomUUID();
            const timerId = setTimeout(() => {
              setUndoToasts(prev => prev.filter(t => t.id !== toastId));
            }, 4000);
            setUndoToasts(prev => [
              ...prev,
              { id: toastId, itemName: match.item!.name, itemId: match.item!.id, timerId },
            ]);
          }
        }
      }

      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = setTimeout(() => {
        setShowResults(false);
        setResults([]);
      }, 4000);
    } else {
      setResults([]);
      setShowResults(false);
      startListening();
    }
  }, [isListening, transcript, interimTranscript, items, stopListening, startListening, onPackItem, onHighlightItem]);

  const handleUndo = useCallback((toast: UndoToast) => {
    clearTimeout(toast.timerId);
    onUnpackItem(toast.itemId);
    setUndoToasts(prev => prev.filter(t => t.id !== toast.id));
  }, [onUnpackItem]);

  const dismissOverlay = useCallback(() => {
    setShowResults(false);
    setResults([]);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      undoToasts.forEach(t => clearTimeout(t.timerId));
    };
  }, []);

  // Don't render if unsupported or all packed
  if (!isSupported || unpackedCount === 0) return null;

  const liveText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div
      className="fixed z-20 flex flex-col items-end gap-2"
      style={{
        bottom: 'calc(56px + max(env(safe-area-inset-bottom, 0px) + 0.75rem, 1rem))',
        right: 'max(calc((100vw - 480px) / 2 + 1.5rem), 1rem)',
      }}
    >
      {/* Error message */}
      {error && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 max-w-[260px] shadow-lg">
          <p className="text-[12px] text-[var(--destructive)]">{error}</p>
        </div>
      )}

      {/* Undo toasts */}
      {undoToasts.map(toast => (
        <div
          key={toast.id}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 flex items-center gap-3 shadow-lg animate-slide-up"
        >
          <p className="text-[13px] text-[var(--text-primary)] font-medium">
            Packed {toast.itemName}
          </p>
          <button
            onClick={() => handleUndo(toast)}
            className="text-[13px] font-semibold text-[var(--lavender)] touch-none"
          >
            Undo
          </button>
        </div>
      ))}

      {/* Results overlay */}
      {showResults && results.length > 0 && (
        <button
          onClick={dismissOverlay}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 max-w-[280px] shadow-lg text-left"
        >
          {results.map((r, i) => (
            <p key={i} className="text-[13px]">
              {r.item ? (
                <span className="text-[var(--salmon)] font-medium">
                  &#10003; {r.item.name}
                </span>
              ) : (
                <span className="text-[var(--text-secondary)]">
                  Not found: {r.spoken}
                </span>
              )}
            </p>
          ))}
        </button>
      )}

      {/* Live transcript overlay */}
      {isListening && liveText.trim() && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 max-w-[260px] shadow-lg">
          <p className="text-[13px] text-[var(--text-primary)] italic">{liveText}</p>
        </div>
      )}

      {/* Listening indicator text */}
      {isListening && !liveText.trim() && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 shadow-lg">
          <p className="text-[12px] text-[var(--text-secondary)]">Listening...</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleToggle}
        aria-label={isListening ? 'Stop voice input' : 'Pack items by voice'}
        className={`w-14 h-14 rounded-full bg-[var(--salmon)] flex items-center justify-center shadow-lg active:scale-95 transition-transform ${isListening ? 'voice-fab-pulse' : ''}`}
        style={{
          boxShadow: '0 4px 12px color-mix(in srgb, var(--salmon) 30%, transparent)',
        }}
      >
        {isListening ? (
          <MicOff size={22} className="text-white" strokeWidth={2.5} />
        ) : (
          <Mic size={22} className="text-white" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
