/** Splits a delimited project type string into normalized lowercase filter tags. */
export function parseProjectTypes(raw: string): string[] {
  return raw
    .split(/[·,/]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
