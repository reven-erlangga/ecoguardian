// Mock localStorage
if (typeof localStorage === 'undefined') {
  (global as any).localStorage = {
    store: {} as Record<string, string>,
    getItem: (k: string) => (global as any).localStorage.store[k] ?? null,
    setItem: (k: string, v: string) => { (global as any).localStorage.store[k] = v; },
    removeItem: (k: string) => { delete (global as any).localStorage.store[k]; },
    clear: () => { (global as any).localStorage.store = {}; },
  };
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});