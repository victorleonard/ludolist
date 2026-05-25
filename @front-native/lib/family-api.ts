import { apiFetch } from '@/lib/api';
import type { FamilyMeResponse } from '@/types/family';

export async function fetchFamilyMe(token: string) {
  const res = await apiFetch<{ data: FamilyMeResponse }>('/api/families/me', {
    token,
  });
  return res.data;
}
