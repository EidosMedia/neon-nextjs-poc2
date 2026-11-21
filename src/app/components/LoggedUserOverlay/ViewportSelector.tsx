'use client';
import { useState } from 'react';
import { Check, ChevronDown, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { setEditorialViewport, setViewportOrientation } from '@/lib/features/loggedUserSlice';
import { ORIENTATION_STORAGE_KEY, VIEWPORT_STORAGE_KEY, viewportDimensions, type EditorialViewport, type ViewportOrientation } from './viewport';
import { handleDropdownKeys } from './dropdownKeys';

const options = [
  { value: 'responsive', label: 'Responsive', detail: 'Fill window', Icon: Monitor },
  { value: 'tablet', label: 'Tablet', Icon: Tablet },
  { value: 'phone', label: 'Phone', Icon: Smartphone },
] as const;

export function selectViewport(value: EditorialViewport, dispatch: ReturnType<typeof useDispatch>) {
  dispatch(setEditorialViewport(value));
  try {
    sessionStorage.setItem(VIEWPORT_STORAGE_KEY, value);
  } catch (error) {
    console.warn('Unable to remember editorial viewport', error);
  }
}

export function selectOrientation(value: ViewportOrientation, dispatch: ReturnType<typeof useDispatch>) {
  dispatch(setViewportOrientation(value));
  try {
    sessionStorage.setItem(ORIENTATION_STORAGE_KEY, value);
  } catch (error) {
    console.warn('Unable to remember editorial viewport orientation', error);
  }
}

export default function ViewportSelector() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const viewport = useSelector((state: RootState) => state.loggedUser.editorialViewport);
  const orientation = useSelector((state: RootState) => state.loggedUser.viewportOrientation);
  const selected = options.find(option => option.value === viewport) ?? options[0];
  return (
    <div className="neon-admin__viewport neon-admin__dropdown" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={event => handleDropdownKeys(event, open, setOpen)}>
      <button type="button" className={`neon-admin__select ${viewport !== 'responsive' ? 'is-active' : ''}`}
        aria-label={`Viewport: ${selected.label}`} aria-expanded={open} aria-haspopup="menu" title="Viewport"
        onClick={() => setOpen(!open)}>
        <selected.Icon size={17} /><ChevronDown size={14} />
      </button>
      {open && <div className="neon-admin__menu" role="menu">
        {options.map(({ value, label, Icon }) => {
          const dimensions = value === 'responsive' ? undefined : viewportDimensions(value, orientation);
          const detail = dimensions ? `${dimensions.width} × ${dimensions.height} px` : 'Fill window';
          return <button type="button" role="menuitemradio" aria-checked={viewport === value} key={value}
            className={viewport === value ? 'is-selected' : ''}
            onClick={() => { selectViewport(value, dispatch); setOpen(false); }}>
            <Icon size={16} /><span>{label}<small>{detail}</small></span>{viewport === value && <Check size={16} />}
          </button>;
        })}
      </div>}
    </div>
  );
}
