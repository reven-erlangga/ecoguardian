export interface SearchProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  onsearch?: (value: string) => void;
  class?: string;
}
