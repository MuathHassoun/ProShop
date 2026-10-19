// lib/settings-client.ts
// Shared by the Settings page and (later) the checkout page,
// so checkout can pre-fill shipping and payment from saved settings.
import type { SavedSettings } from '@/types';

export async function fetchSavedSettings(userId: number): Promise<SavedSettings> {
  const response = await fetch(`/api/settings?userId=${userId}`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Could not load your settings');
  }

  return { address: data.address ?? null, payment: data.payment ?? null };
}
