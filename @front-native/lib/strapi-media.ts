import { API_URL } from '@/lib/api';
import type { StrapiImage } from '@/types/family';

export function resolveStrapiImageUrl(
  image?: StrapiImage | null,
  imageUrlDirect?: string | null,
): string | null {
  if (imageUrlDirect && typeof imageUrlDirect === 'string' && imageUrlDirect.trim()) {
    return imageUrlDirect.trim();
  }
  if (!image || typeof image !== 'object') return null;

  const relative =
    image.formats?.medium?.url ??
    image.formats?.small?.url ??
    image.formats?.thumbnail?.url ??
    image.url;

  if (!relative) return null;
  if (relative.startsWith('http')) return relative;
  return `${API_URL}${relative}`;
}
