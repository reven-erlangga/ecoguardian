export interface InputProps {
  value?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  class?: string;
  oninput?: (e: Event) => void;
}
