// NEXT_PUBLIC_BASE_PATH is inlined at build time; it must match basePath in next.config.ts.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
