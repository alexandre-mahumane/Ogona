/** Normaliza telemóvel MZ para E.164 (+258...). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('258') && digits.length >= 12) {
    return `+${digits}`;
  }

  if (digits.length === 9) {
    return `+258${digits}`;
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return raw.trim();
}

export function isValidPhone(normalized: string): boolean {
  return /^\+\d{10,15}$/.test(normalized);
}
