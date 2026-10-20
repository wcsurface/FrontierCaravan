export interface ArtistSearchResult {
  id: string; // MBID
  name: string;
  disambiguation?: string;
  country?: string;
}

export async function searchArtistMusicBrainz(query: string): Promise<ArtistSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const url = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'EncoreConcertLogger/1.0.0 (contact@encorelogger.internal)'
      }
    });

    if (!res.ok) {
      throw new Error(`MusicBrainz query failed with status: ${res.status}`);
    }

    const data = await res.json();
    return (data.artists || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      disambiguation: item.disambiguation || '',
      country: item.country || '',
    }));
  } catch (e) {
    console.warn('[MusicBrainz] Search query failed, falling back to local entry:', e);
    return [{ id: `mb_${Date.now()}`, name: query, disambiguation: 'Local Entry' }];
  }
}
