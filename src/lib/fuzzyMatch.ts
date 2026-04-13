import Fuse from 'fuse.js';
import type { PackingItem } from '../db/models';

export interface MatchResult {
  spoken: string;
  item: PackingItem | null;
  isAmbiguous: boolean;
  nearMatches: PackingItem[];
}

/**
 * Split a transcript into individual item fragments.
 * Splits on: " and ", ",", ".", " then ", " also "
 */
function splitTranscript(transcript: string): string[] {
  return transcript
    .split(/\s+and\s+|,|\.\s*|\s+then\s+|\s+also\s+/i)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);
}

/**
 * Match spoken fragments against unpacked packing items.
 * Uses Fuse.js for fuzzy matching with a fallback to substring/word-level checks.
 */
/**
 * Find top 2 near-miss items that scored between 0.4 and 0.6 (just above match threshold).
 */
function findNearMatches(
  query: string,
  items: PackingItem[],
  alreadyMatched: Set<string>,
): PackingItem[] {
  const nearFuse = new Fuse(items.filter(i => !alreadyMatched.has(i.id)), {
    keys: ['name'],
    threshold: 0.6,
    includeScore: true,
    ignoreLocation: true,
  });

  return nearFuse
    .search(query)
    .filter(r => r.score! > 0.4 && r.score! <= 0.6)
    .sort((a, b) => a.score! - b.score!)
    .slice(0, 2)
    .map(r => r.item);
}

/**
 * Match spoken fragments against unpacked packing items.
 * Uses Fuse.js for fuzzy matching with a fallback to substring/word-level checks.
 */
export function matchSpokenItems(
  transcript: string,
  items: PackingItem[],
): MatchResult[] {
  if (!transcript.trim()) return [];

  const unpacked = items.filter(i => !i.isPacked);
  if (unpacked.length === 0) return [];

  const fuse = new Fuse(unpacked, {
    keys: ['name'],
    threshold: 0.4, // 0 = exact, 1 = match anything
    includeScore: true,
    ignoreLocation: true, // match anywhere in the string
  });

  const fragments = splitTranscript(transcript);
  const results: MatchResult[] = [];
  const alreadyMatched = new Set<string>();

  for (const fragment of fragments) {
    const fuseResults = fuse.search(fragment)
      .filter(r => !alreadyMatched.has(r.item.id));

    if (fuseResults.length === 0) {
      // Try each word individually if the full fragment didn't match
      const words = fragment.split(/\s+/).filter(w => w.length >= 3);
      if (words.length > 1) {
        for (const word of words) {
          const wordResults = fuse.search(word).filter(r => !alreadyMatched.has(r.item.id));
          if (wordResults.length > 0) {
            const bestScore = wordResults[0].score!;
            const close = wordResults.filter(r => r.score! - bestScore < 0.1);
            const best = close.sort((a, b) => a.item.name.length - b.item.name.length)[0];
            alreadyMatched.add(best.item.id);
            results.push({ spoken: word, item: best.item, isAmbiguous: close.length > 1, nearMatches: [] });
          } else {
            const near = findNearMatches(word, unpacked, alreadyMatched);
            results.push({ spoken: word, item: null, isAmbiguous: false, nearMatches: near });
          }
        }
      } else {
        const near = findNearMatches(fragment, unpacked, alreadyMatched);
        results.push({ spoken: fragment, item: null, isAmbiguous: false, nearMatches: near });
      }
    } else {
      const bestScore = fuseResults[0].score!;
      // Group results within a tight score range of the best match
      const closeMatches = fuseResults.filter(r => r.score! - bestScore < 0.1);
      const best = closeMatches.sort((a, b) => a.item.name.length - b.item.name.length)[0];

      alreadyMatched.add(best.item.id);
      results.push({
        spoken: fragment,
        item: best.item,
        isAmbiguous: closeMatches.length > 1,
        nearMatches: [],
      });
    }
  }

  return results;
}
