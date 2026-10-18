// components/auth/validation.ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => EMAIL_RE.test(value);

export const MIN_PASSWORD_LENGTH = 8;

export function readForm<K extends string>(form: HTMLFormElement, keys: readonly K[]) {
  const data = new FormData(form);
  return Object.fromEntries(keys.map((k) => [k, String(data.get(k) ?? '')])) as Record<K, string>;
}
