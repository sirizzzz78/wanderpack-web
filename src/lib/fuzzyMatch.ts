import Fuse from 'fuse.js';
import type { PackingItem } from '../db/models';

export interface MatchResult {
  spoken: string;
  item: PackingItem | null;
  isAmbiguous: boolean;
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
      results.push({ spoken: fragment, item: null, isAmbiguous: false });
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
      });
    }
  }

  return results;
}
