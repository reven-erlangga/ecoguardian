// ponytail: snake_case → camelCase converter
// Backend pakai snake_case dari GraphQL response, frontend pakai camelCase.
//
// Usage:
//   toCamelCase('user_id')        // → 'userId'
//   camelizeKeys({ user_id: 1 })  // → { userId: 1 }
//   camelizeKeys([{ user_id: 1 }]) // → [{ userId: 1 }]

const UNDERSCORE_RE = /_([a-z0-9])/g;

export function toCamelCase(str: string): string {
  return str.replace(UNDERSCORE_RE, (_, c) => c.toUpperCase());
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function camelizeKeys<T = unknown>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => camelizeKeys(item)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      const camelKey = toCamelCase(key);
      out[camelKey] = camelizeKeys((input as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  return input;
}