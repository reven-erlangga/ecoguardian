import type { AuthTemplateProps } from './auth-template.types';

export function useAuthTemplate(p: AuthTemplateProps) {
  return { title: p.title };
}
