export const DEFAULT_QUERY_MAX_LENGTH = 100;
export const DEFAULT_QUERY_DISPLAY_MAX_LENGTH = 75;

export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeQueryText(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function limitQueryText(
  value: string,
  maxLength = DEFAULT_QUERY_MAX_LENGTH,
): string {
  const decoded = safeDecodeURIComponent(value);
  const normalized = normalizeQueryText(decoded);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength);
}

export function shouldLimitQueryText(
  value: string,
  maxLength = DEFAULT_QUERY_MAX_LENGTH,
): boolean {
  const decoded = safeDecodeURIComponent(value);
  const normalized = normalizeQueryText(decoded);

  return normalized.length > maxLength || normalized !== value;
}

export function truncateQueryForDisplay(
  value: string,
  maxLength = DEFAULT_QUERY_DISPLAY_MAX_LENGTH,
): string {
  const normalized = normalizeQueryText(safeDecodeURIComponent(value));

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}…`;
}