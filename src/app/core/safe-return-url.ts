/** Relative in-app path only — rejects protocol-relative and external URLs. */
export function safeReturnUrl(raw: string | null | undefined, fallback = '/os'): string {
  if (!raw) {
    return fallback;
  }
  const value = raw.trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  if (
    value.includes('://') ||
    value.toLowerCase().startsWith('/login') ||
    value.toLowerCase().startsWith('/register')
  ) {
    return fallback;
  }
  return value;
}
