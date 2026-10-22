// lib/admin-validate.ts
import 'server-only';
import { NextResponse } from 'next/server';

export const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
export const optStr = (v: unknown) => str(v) || null;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function optId(v: unknown): number | null | undefined {
  if (v === null || v === '' || v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function optUrl(v: unknown): string | null | undefined {
  const s = str(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? s : undefined;
  } catch {
    return s.startsWith('/') ? s : undefined;
  }
}

export const money = (n: number) => Math.round(n * 100) / 100;

export const pgCode = (e: unknown) => (e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '');