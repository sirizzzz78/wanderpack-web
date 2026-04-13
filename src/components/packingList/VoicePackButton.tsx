import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, PartyPopper } from 'lucide-react';
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
    onSilenceTimeoutRef,
    clearError,
  } = useSpeechRecognition();

  const [results, setResults] = useState<MatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [undoToasts, setUndoToasts] = useState<UndoToast[]>([]);
  const [showAllPacked, setShowAllPacked] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const unpackedCount = items.filter(i => !i.isPacked).length;

  const addUndoToast = useCallback((item: PackingItem) => {
    const toastId = crypto.randomUUID();
    const timerId = setTimeout(() => {
      setUndoToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
    setUndoToasts(prev => [
      ...prev,
      { id: toastId, itemName: item.name, itemId: item.id, timerId },
    ]);
  }, []);

  const checkAllPacked = useCallback(() => {
    // Check against current unpacked minus 1 (the one we just packed)
    if (items.filter(i => !i.isPacked).length === 0) {
      setShowAllPacked(true);
      setTimeout(() => setShowAllPacked(false), 2000);
    }
  }, [items]);

  const packSuggestion = useCallback((item: PackingItem) => {
    onPackItem(item.id);
    onHighlightItem?.(item.id);
    addUndoToast(item);

    // Remove the result that had this suggestion
    setResults(prev => {
      const next = prev.filter(r => !r.item && !r.nearMatches.some(n => n.id === item.id) ? false : r.item !== null);
      // Actually filter: keep matched results, remove the unmatched one that contained this suggestion
      return prev.filter(r => {
        if (r.item) return true;
        return !r.nearMatches.some(n => n.id === item.id);
      });
    });

    // Defer check so state has updated
    setTimeout(() => checkAllPacked(), 50);
  }, [onPackItem, onHighlightItem, addUndoToast, checkAllPacked]);

  const processResults = useCallback((transcriptToUse: string) => {
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
        // Undo toast for ALL matches
        addUndoToast(match.item);
      }
    }

    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => {
      setShowResults(false);
      setResults([]);
    }, 4000);

    // Check all packed after a tick
    setTimeout(() => checkAllPacked(), 50);
  }, [items, onPackItem, onHighlightItem, addUndoToast, checkAllPacked]);

  const handleToggle = useCallback(() => {
    if (isListening) {
      const finalTranscript = stopListening();
      const transcriptToUse = finalTranscript || (transcript + ' ' + interimTranscript).trim();
      processResults(transcriptToUse);
    } else {
      setResults([]);
      setShowResults(false);
      startListening();
    }
  }, [isListening, transcript, interimTranscript, stopListening, startListening, processResults]);

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

  const handleRetry = useCallback(() => {
    clearError?.();
    handleToggle();
  }, [clearError, handleToggle]);

  // Auto-stop after 5s silence
  useEffect(() => {
    onSilenceTimeoutRef.current = () => {
      handleToggle();
    };
    return () => { onSilenceTimeoutRef.current = null; };
  }, [handleToggle, onSilenceTimeoutRef]);

  // Reset countdown ring when transcript changes
  useEffect(() => {
    if (isListening) {
      setCountdownKey(prev => prev + 1);
    }
  }, [transcript, interimTranscript, isListening]);

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (error) {
      errorTimerRef.current = setTimeout(() => {
        clearError?.();
      }, 5000);
      return () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); };
    }
  }, [error, clearError]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      undoToasts.forEach(t => clearTimeout(t.timerId));
    };
  }, []);

  // Don't render if unsupported or (all packed and no celebration)
  if (!isSupported || (unpackedCount === 0 && !showAllPacked)) return null;

  const liveText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div
      className="fixed z-20 flex flex-col items-end gap-2"
      style={{
        bottom: 'calc(56px + max(env(safe-area-inset-bottom, 0px) + 0.75rem, 1rem))',
        right: 'max(calc((100vw - 480px) / 2 + 1.5rem), 1rem)',
      }}
    >
      {/* Error message with retry */}
      {error && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 max-w-[260px] shadow-lg animate-slide-up">
          <p className="text-[12px] text-[var(--destructive)]">{error}</p>
          <button
            onClick={handleRetry}
            className="text-[13px] font-semibold text-[var(--lavender)] mt-1 touch-none"
          >
            Try Again
          </button>
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

      {/* "All packed!" celebration */}
      {showAllPacked && (
        <div className="bg-[var(--salmon-tint)] border border-[var(--salmon)] rounded-[12px] px-4 py-3 flex items-center gap-2 shadow-lg animate-slide-up">
          <PartyPopper size={16} className="text-[var(--salmon)]" />
          <p className="text-[13px] text-[var(--salmon)] font-semibold">All packed!</p>
        </div>
      )}

      {/* Results overlay */}
      {showResults && results.length > 0 && (
        <div
          onClick={dismissOverlay}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-3 max-w-[280px] shadow-lg text-left animate-slide-up cursor-pointer"
        >
          {results.map((r, i) => (
            <div key={i} className="text-[13px]">
              {r.item ? (
                <p className="text-[var(--salmon)] font-medium">
                  &#10003; {r.item.name}
                </p>
              ) : (
                <div>
                  <p className="text-[var(--text-secondary)]">
                    Not found: {r.spoken}
                  </p>
                  {r.nearMatches.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[12px] text-[var(--text-secondary)]">Did you mean:</span>
                      {r.nearMatches.map(suggestion => (
                        <button
                          key={suggestion.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            packSuggestion(suggestion);
                          }}
                          className="text-[13px] font-semibold text-[var(--lavender)] underline touch-none"
                        >
                          {suggestion.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
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

      {/* FAB with countdown ring */}
      {!showAllPacked && (
        <div className="relative">
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

          {/* Countdown ring */}
          {isListening && (
            <svg
              key={countdownKey}
              className="absolute inset-[-5px] w-[66px] h-[66px] pointer-events-none voice-countdown-ring"
              viewBox="0 0 66 66"
            >
              <circle
                cx="33"
                cy="33"
                r="30"
                fill="none"
                stroke="var(--salmon)"
                strokeOpacity="0.4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset="0"
                transform="rotate(-90 33 33)"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
