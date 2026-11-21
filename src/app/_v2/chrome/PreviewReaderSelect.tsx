'use client';
import { useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { setPreviewReaderTier } from '@/lib/features/loggedUserSlice';
import { PREVIEW_READER_TIERS } from '../lib/paywall';

export default function PreviewReaderSelect() {
  const id = useId();
  const dispatch = useDispatch();
  const tier = useSelector((state: RootState) => state.loggedUser.previewReaderTier);
  return (
    <label htmlFor={id} className="flex items-center gap-2 px-3 text-white">
      Reader view
      <select
        id={id} value={tier} className="rounded border border-white px-2 py-1 bg-gray-800 text-white"
        onChange={(event) => {
          const value = PREVIEW_READER_TIERS.find(level => level === event.target.value);
          if (value) dispatch(setPreviewReaderTier(value));
        }}
      >
        {PREVIEW_READER_TIERS.map(level => <option key={level} value={level}>{level}</option>)}
      </select>
    </label>
  );
}
