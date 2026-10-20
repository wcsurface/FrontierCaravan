export interface ParsedTrack {
  position: number;
  songTitle: string;
  isEncore: boolean;
  encoreNumber: number;
  originalArtist?: string;
  notes?: string;
}

/**
 * Parses raw unformatted copy-pasted setlists into structured tracks.
 * Handles patterns:
 * "1. Track Name"
 * "Encore: Track Name"
 * "Track Name (Band Cover)"
 */
export function parseRawSetlist(rawText: string): ParsedTrack[] {
  if (!rawText) return [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const parsedTracks: ParsedTrack[] = [];

  let currentEncoreNumber = 0;
  let isCurrentlyEncore = false;
  let trackCounter = 1;

  for (const line of lines) {
    // Check for Encore header
    const encoreMatch = line.match(/^encore\s*(\d*):?/i);
    if (encoreMatch) {
      isCurrentlyEncore = true;
      currentEncoreNumber = encoreMatch[1] ? parseInt(encoreMatch[1], 10) : (currentEncoreNumber + 1);
      continue;
    }

    // Strip leading track numbers like "1.", "01 -", "1)", etc.
    let cleanedLine = line.replace(/^\d+[\.\-\)]\s*/, '').trim();

    // Check for cover notes e.g., (Led Zeppelin cover)
    let originalArtist: string | undefined = undefined;
    const coverMatch = cleanedLine.match(/\((.*?)\s+cover\)/i);
    if (coverMatch) {
      originalArtist = coverMatch[1];
      cleanedLine = cleanedLine.replace(/\(.*?\s+cover\)/i, '').trim();
    }

    if (cleanedLine.length > 0) {
      parsedTracks.push({
        position: trackCounter++,
        songTitle: cleanedLine,
        isEncore: isCurrentlyEncore,
        encoreNumber: currentEncoreNumber,
        originalArtist,
      });
    }
  }

  return parsedTracks;
}
