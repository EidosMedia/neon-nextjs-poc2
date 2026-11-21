'use client';
import { useRef, useState } from 'react';
import { Check, ChevronDown, Crown, UserRound, UserRoundCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { setPreviewReaderTier } from '@/lib/features/loggedUserSlice';
import { handleDropdownKeys } from '@/app/components/LoggedUserOverlay/dropdownKeys';
import { PREVIEW_READER_TIERS, type PreviewReaderTier } from '../lib/paywall';

const readerOptions = {
  FREE: { label: 'Free', detail: 'Anonymous reader', Icon: UserRound },
  REGISTERED: { label: 'Registered', detail: 'Signed-in reader', Icon: UserRoundCheck },
  PREMIUM: { label: 'Premium', detail: 'Premium subscriber', Icon: Crown },
} satisfies Record<PreviewReaderTier, { label: string; detail: string; Icon: typeof UserRound }>;

export default function PreviewReaderSelect() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();
  const tier = useSelector((state: RootState) => state.loggedUser.previewReaderTier);
  return (
    <div className="neon-admin__reader">
      <span>Reader view</span>
      <div className="neon-admin__dropdown" onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }} onKeyDown={event => handleDropdownKeys(event, open, setOpen)}>
        <button ref={triggerRef} type="button" className="neon-admin__select"
          aria-label={`Reader view: ${readerOptions[tier].label}`} aria-expanded={open} aria-haspopup="menu"
          onClick={() => setOpen(!open)}>
          {readerOptions[tier].label}<ChevronDown size={14} />
        </button>
        {open && <div className="neon-admin__menu" role="menu" aria-label="Reader view">
          {PREVIEW_READER_TIERS.map(level => {
            const { label, detail, Icon } = readerOptions[level];
            return <button type="button" role="menuitemradio" aria-checked={tier === level} key={level}
              className={tier === level ? 'is-selected' : ''}
              onClick={() => {
                dispatch(setPreviewReaderTier(level));
                triggerRef.current?.focus();
                setOpen(false);
              }}>
              <Icon size={16} /><span>{label}<small>{detail}</small></span>{tier === level && <Check size={16} />}
            </button>;
          })}
        </div>}
      </div>
    </div>
  );
}
