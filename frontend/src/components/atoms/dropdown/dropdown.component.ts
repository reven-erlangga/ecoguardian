// ponytail: class CSS untuk Dropdown — neobrutalism style mirror ui/dropdown-menu.tsx

/** Trigger button */
export const dropdownTrigger =
  'border-2 border-border rounded-base bg-secondary-background px-4 py-2 text-sm font-heading flex items-center gap-2 hover:bg-accent transition-colors';

/** Menu items wrapper */
export const dropdownContent =
  'absolute right-0 mt-1 z-50 min-w-[180px] overflow-hidden rounded-base border-2 border-border bg-main text-main-foreground p-1 font-base shadow-shadow';

/** Menu item button */
export const dropdownItem =
  'relative flex cursor-default select-none items-center rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden transition-colors w-full text-left hover:border-border data-[selected=true]:font-heading';

/** Divider */
export const dropdownSeparator = '-mx-1 my-1 h-0.5 bg-border';

/** Label */
export const dropdownLabel = 'px-2 py-1.5 text-sm font-heading';
