'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, ChevronDown, History } from 'lucide-react';
import useVersions from '@/hooks/useVersions';
import useAuthContext from '@/hooks/useAuthContext';
import { setVersionPanelOpen } from '@/lib/features/versionsSlice';
import type { RootState } from '@/lib/store';
import { getSwitchTargetViewStatus, normalizeViewStatus, ViewStatus as ViewStatusEnum } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { ORIENTATION_QUERY_KEY, VIEWPORT_QUERY_KEY } from './viewport';
import type { LoggedUserBarProps } from './LoggedUserOverlay.types';
import { handleDropdownKeys } from './dropdownKeys';

export default function ViewStatus({ data }: LoggedUserBarProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const viewport = useSelector((state: RootState) => state.loggedUser.editorialViewport);
  const orientation = useSelector((state: RootState) => state.loggedUser.viewportOrientation);
  const { data: authContext } = useAuthContext();
  const status = normalizeViewStatus(data.siteData.viewStatus);
  const canUseVersions = status === ViewStatusEnum.PREVIEW || authContext.hasEditorialAuth;
  const currentNode = 'model' in data ? data.model.data : undefined;
  const { getVersionLabelFromVersion, getLatestViewVersion } = useVersions({
    currentNode, viewStatus: status, enabled: canUseVersions,
  });
  const { getLatestViewVersion: getLatestPreviewVersion } = useVersions({
    currentNode, viewStatus: ViewStatusEnum.PREVIEW,
    enabled: canUseVersions && status === ViewStatusEnum.LIVE,
  });
  if (!currentNode?.url) return null;

  const version = canUseVersions
    ? getVersionLabelFromVersion(currentNode.version || (status === ViewStatusEnum.LIVE ? currentNode.id : ''), status)
    : status;
  const isLatest = version === ViewStatusEnum.PREVIEW || version === ViewStatusEnum.LIVE;
  const isLive = version.startsWith(ViewStatusEnum.LIVE);

  const switchView = () => {
    const target = getSwitchTargetViewStatus(status);
    let pathname = currentNode.url;
    if (status === ViewStatusEnum.LIVE && target === ViewStatusEnum.PREVIEW) {
      try {
        pathname = new URL(getLatestPreviewVersion(ViewStatusEnum.PREVIEW).pubInfo.canonical, window.location.origin).pathname;
      } catch (reason) {
        console.warn('Unable to resolve latest preview version URL for view switch', reason);
      }
    }
    const url = new URL(pathname, window.location.origin);
    url.searchParams.set('switch-view', target);
    url.searchParams.set(VIEWPORT_QUERY_KEY, viewport);
    url.searchParams.set(ORIENTATION_QUERY_KEY, orientation);
    window.location.href = `${url.pathname}${url.search}`;
  };
  const latest = () => {
    try {
      window.location.href = getLatestViewVersion(status).pubInfo.canonical;
    } catch (reason) {
      console.error('Unable to resolve latest version', reason);
      setError('Latest version is unavailable. Try again when history has loaded.');
    }
  };

  return (
    <div className="neon-admin__dropdown" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={event => handleDropdownKeys(event, open, setOpen)}>
      <button type="button" className={`neon-admin__mode ${!isLatest ? 'is-version' : ''}`}
        aria-label={`View status: ${version}`} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>
        <span className={`neon-admin__dot ${isLive ? 'is-live' : ''}`} />
        <span className="neon-admin__mode-label">{version}</span>
        <ChevronDown size={14} />
      </button>
      {open && <div className="neon-admin__menu neon-admin__mode-menu" role="menu">
        <button type="button" role="menuitem" onClick={isLatest ? () => setOpen(false) : latest}>
          <span className={`neon-admin__dot ${status === ViewStatusEnum.LIVE ? 'is-live' : ''}`} />
          <span>{status === ViewStatusEnum.LIVE ? 'Live' : 'Preview'}<small>Latest version</small></span>
          {isLatest && <Check size={16} />}
        </button>
        <button type="button" role="menuitem" onClick={switchView}>
          <span className={`neon-admin__dot ${status === ViewStatusEnum.PREVIEW ? 'is-live' : ''}`} />
          <span>{status === ViewStatusEnum.LIVE ? 'Preview' : 'Live'}<small>Switch view</small></span>
        </button>
        {canUseVersions && <button type="button" role="menuitem" onClick={() => {
          dispatch(setVersionPanelOpen(true)); setOpen(false);
        }}><History size={16} /><span>Versions history</span></button>}
        {error && <p role="alert" className="neon-admin__error">{error}</p>}
      </div>}
    </div>
  );
}
