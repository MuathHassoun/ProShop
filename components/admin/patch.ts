// components/admin/patch.ts
'use client';

export interface SendResult {
  error: string | null;
  data: Record<string, unknown> | null;
}

export async function sendJson(
  method: 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: Record<string, unknown>
): Promise<SendResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { error: null, data };
    return { error: data.error || 'Something went wrong. Please try again.', data: null };
  } catch {
    return { error: 'Network error. Please try again.', data: null };
  }
}

export async function patchJson(url: string, body: Record<string, unknown>): Promise<string | null> {
  return (await sendJson('PATCH', url, body)).error;
}