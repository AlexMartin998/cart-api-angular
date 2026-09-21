const TONES = [
  'var(--color-tone-0)',
  'var(--color-tone-1)',
  'var(--color-tone-2)',
  'var(--color-tone-3)',
  'var(--color-tone-4)',
  'var(--color-tone-5)',
] as const;

export function categoryTone(categoryId: number): string {
  return TONES[Math.abs(categoryId) % TONES.length];
}

export function productMark(code: string): string {
  const digits = code.replace(/\D/g, '');

  if (digits.length > 0) {
    return digits.slice(-2).padStart(2, '0');
  }

  return code.slice(0, 2).toUpperCase();
}
