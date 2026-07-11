/**
 * MediaLibrary
 *
 * Two-tab component:
 *   Local  — file picker + recent images grid (paths stored in localStorage)
 *   Unsplash — search input + photo grid with attribution
 *
 * Props:
 *   onSelect(url)  — called with a local absolute path or HTTPS URL
 *   onClose()      — called when user dismisses the panel
 *   field          — 'logo' | 'hero' | 'favicon' — used for labelling only
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlated } from '../hooks/usePlated.js';
import styles from './MediaLibrary.module.css';

const RECENT_KEY = 'plated:recentMedia';
const MAX_RECENT = 20;
const UNSPLASH_PER_PAGE = 20;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); }
  catch { return []; }
}

function saveRecent(paths: string[]): void {
  localStorage.setItem(RECENT_KEY, JSON.stringify(paths.slice(0, MAX_RECENT)));
}

function addToRecent(path: string): void {
  const prev = loadRecent().filter((p) => p !== path);
  saveRecent([path, ...prev]);
}

type Tab = 'local' | 'unsplash';

interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string; full: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
}

export interface MediaLibraryProps {
  field: 'logo' | 'hero' | 'favicon';
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaLibrary({ field, onSelect, onClose }: MediaLibraryProps) {
  const plated           = usePlated();
  const [tab, setTab]    = useState<Tab>('local');
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [query, setQuery]   = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [searching, setSearching] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Local file picker ────────────────────────────────────────────────
  async function handleLocalPick() {
    const ext = field === 'logo' || field === 'favicon'
      ? ['png', 'jpg', 'jpeg', 'webp', 'svg']
      : ['png', 'jpg', 'jpeg', 'webp'];
    const path = await plated.pickFile({ filters: [{ name: 'Images', extensions: ext }] });
    if (!path) return;
    addToRecent(path);
    setRecent(loadRecent());
    onSelect(path);
  }

  function handleRecentSelect(path: string) {
    onSelect(path);
  }

  // ─── Unsplash ──────────────────────────────────────────────────────────
  const searchUnsplash = useCallback(async (q: string) => {
    if (!q.trim()) { setPhotos([]); return; }
    setSearching(true);
    setUnsplashError(null);
    try {
      // Unsplash API key is injected at build time via Vite env
      const key = (import.meta as unknown as { env: Record<string, string> }).env
        .VITE_UNSPLASH_ACCESS_KEY ?? '';
      if (!key) throw new Error('VITE_UNSPLASH_ACCESS_KEY not set');
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${UNSPLASH_PER_PAGE}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${key}` } },
      );
      if (!res.ok) throw new Error(`Unsplash ${res.status}`);
      const data = (await res.json()) as { results: UnsplashPhoto[] };
      setPhotos(data.results);
    } catch (err) {
      setUnsplashError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void searchUnsplash(query), 500);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchUnsplash]);

  function handleUnsplashSelect(photo: UnsplashPhoto) {
    // Use the "regular" size (~1080px wide) — good balance for hero images
    const url = photo.urls.regular;
    addToRecent(url);
    setRecent(loadRecent());
    onSelect(url);
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          {field === 'logo' ? 'Logo' : field === 'hero' ? 'Hero image' : 'Favicon'}
        </span>
        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
          ✕
        </button>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${tab === 'local' ? styles.tabActive : ''}`}
          onClick={() => setTab('local')} type="button"
        >
          Local files
        </button>
        <button
          className={`${styles.tab} ${tab === 'unsplash' ? styles.tabActive : ''}`}
          onClick={() => setTab('unsplash')} type="button"
        >
          Unsplash
        </button>
      </div>

      {tab === 'local' && (
        <div className={styles.tabPane}>
          <button className={styles.pickBtn} onClick={() => void handleLocalPick()} type="button">
            📂 Browse files…
          </button>

          {recent.length > 0 && (
            <>
              <p className={styles.sectionLabel}>Recent</p>
              <div className={styles.photoGrid}>
                {recent.map((path) => (
                  <button
                    key={path}
                    className={styles.photoBtn}
                    onClick={() => handleRecentSelect(path)}
                    type="button"
                    title={path}
                  >
                    <img
                      className={styles.photoImg}
                      src={path.startsWith('/') ? `file://${path}` : path}
                      alt=""
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </>
          )}

          {recent.length === 0 && (
            <p className={styles.empty}>No recent files. Pick one above to get started.</p>
          )}
        </div>
      )}

      {tab === 'unsplash' && (
        <div className={styles.tabPane}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder='Search Unsplash… e.g. "restaurant interior"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          {searching && <p className={styles.empty}>Searching…</p>}
          {unsplashError && <p className={styles.error}>{unsplashError}</p>}

          {!searching && photos.length > 0 && (
            <>
              <div className={styles.photoGrid}>
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    className={styles.photoBtn}
                    onClick={() => handleUnsplashSelect(photo)}
                    type="button"
                    title={photo.alt_description ?? photo.user.name}
                  >
                    <img
                      className={styles.photoImg}
                      src={photo.urls.small}
                      alt={photo.alt_description ?? ''}
                      loading="lazy"
                    />
                    <span className={styles.attribution}>
                      {photo.user.name}
                    </span>
                  </button>
                ))}
              </div>
              <p className={styles.unsplashNote}>
                Photos from{' '}
                <a
                  href="https://unsplash.com"
                  onClick={(e) => { e.preventDefault(); void plated.openExternal('https://unsplash.com'); }}
                >
                  Unsplash
                </a>. Selecting a photo credits the photographer.
              </p>
            </>
          )}

          {!searching && photos.length === 0 && query.trim() && !unsplashError && (
            <p className={styles.empty}>No results for “{query}”.</p>
          )}

          {!query.trim() && (
            <p className={styles.empty}>Type a keyword to search stock photos.</p>
          )}
        </div>
      )}
    </div>
  );
}
