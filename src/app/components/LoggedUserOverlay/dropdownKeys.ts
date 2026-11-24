import type { KeyboardEvent } from 'react';

export function handleDropdownKeys(event: KeyboardEvent<HTMLDivElement>, open: boolean, setOpen: (open: boolean) => void) {
  const container = event.currentTarget;
  const trigger = container.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]');
  if (event.key === 'Escape' && open) {
    event.preventDefault();
    setOpen(false);
    trigger?.focus();
    return;
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (!open) {
    setOpen(true);
    requestAnimationFrame(() => container.querySelector<HTMLButtonElement>('[role="menu"] button')?.focus());
    return;
  }
  const items = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="menu"] button'));
  if (!items.length) return;
  const current = items.indexOf(container.ownerDocument.activeElement as HTMLButtonElement);
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
    : event.key === 'ArrowDown' ? (current + 1) % items.length : (current <= 0 ? items.length - 1 : current - 1);
  items[index].focus();
}
