export type MediaType = 'image' | 'logo' | 'favicon-source' | 'menu-photo' | 'gallery';

/**
 * MediaRecord — Supabase `media` table row shape.
 */
export interface MediaRecord {
  id: string;
  siteId: string;
  filename: string;
  storagePath: string;
  url: string;
  type: MediaType;
  /** File size in bytes */
  size: number;
  createdAt: string;
}
