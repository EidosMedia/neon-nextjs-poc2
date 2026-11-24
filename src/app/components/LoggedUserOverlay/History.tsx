'use client';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEqual } from 'lodash';
import { History as HistoryIcon, LoaderCircle, X } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { type BaseModel, type NodeVersion, type PageData, normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import useVersions from '@/hooks/useVersions';
import useAuthContext from '@/hooks/useAuthContext';
import { setInspectItemsVisible, setInspectItems } from '@/lib/features/loggedUserSlice';

type SysData = { baseType: string; type: string; lockedBy?: { userId: string; userName: string }; lockedTime?: string };

function dateGroup(item: NodeVersion): string {
  const date = new Date(item.versionDate);
  if (item.versionTimestamp === -1 || Number.isNaN(date.getTime())) return 'Working copy';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function History({ data }: { data: PageData<BaseModel> }) {
  const [latestPreviewSysData, setLatestPreviewSysData] = useState<SysData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [rollbackingId, setRollbackingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'live'>('all');
  const { data: authContext } = useAuthContext();
  const viewStatus = normalizeViewStatus(data.siteData.viewStatus);
  const canUseVersions = viewStatus === ViewStatus.PREVIEW || authContext.hasEditorialAuth;
  const { data: historyData, setPanelOpened, panelOpened, isLoading, isError, refetch } = useVersions({
    currentNode: data.model.data, viewStatus, enabled: canUseVersions,
  });
  const dispatch = useDispatch();
  const versions = historyData.versions ?? [];
  const latestLive = versions.find(item => item.live);
  const latestEdit = versions.find(item => !item.live && item.versionTimestamp !== -1);
  const webPageType = ['webpage', 'homewebpage', 'sectionwebpage'].includes(data.model.data.sys.baseType);
  const hasVersions = Boolean(versions.length);
  const filteredVersions = versions.filter(item => filter === 'all' || item.live);

  useEffect(() => {
    let active = true;
    const fetchLatestPreviewSysData = async (): Promise<SysData | null> => {
      try {
        const fetchUrl = data.model.data.url.replace(/(-\d{4})[^/]*(?=\/index\.html)/, '$1');
        const res = await fetch(fetchUrl + '?neon.outputMode=RAW');
        const json = await res.json();
        return json?.model?.data?.sys ?? null;
      } catch (error) {
        console.warn('Error fetching sys data:', error);
        return null;
      }
    };
    if (webPageType) {
      dispatch(setInspectItemsVisible(true));
    } else {
      dispatch(setInspectItemsVisible(hasVersions && latestEdit?.nodeId === data.model.data.version));
      dispatch(setInspectItems(false));
    }
    if (/-n[0-9a-zA-Z]+/.test(data.model.data.url) && viewStatus === ViewStatus.PREVIEW) {
      fetchLatestPreviewSysData().then(sys => {
        if (active) setLatestPreviewSysData(previous => isEqual(sys, previous) ? previous : sys);
      });
    }
    setLoadingHistory(false);
    return () => { active = false; };
  }, [dispatch, webPageType, viewStatus, hasVersions, latestEdit?.nodeId,
    data.model.data.id, data.model.data.version, data.model.data.url]);

  async function rollbackTo(item: NodeVersion) {
    const versionName = `${item.major}.${item.minor}`;
    if (!confirm(`Are you sure you want to Rollback to version ${versionName}`)) return;
    setRollbackError(null);
    setRollbackingId(item.nodeId);
    try {
      const response = await fetch('/api/versions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: item.nodeId, baseType: data.model.data.sys.baseType }),
      });
      if (!response.ok) {
        setRollbackError(`Rollback to version ${versionName} failed (HTTP ${response.status}). Please try again.`);
        return;
      }
      const result = await response.json();
      if (!result?.nodeRef) {
        setRollbackError(`Rollback to version ${versionName} did not return a valid result. Please refresh and check.`);
        return;
      }
      const removeVersion = (url: string) => url.replace(/(-n?\d{10,20})(?=\/|$)/, '');
      window.location.href = removeVersion(window.location.href).replace(removeVersion(data.model.data.id), result.nodeRef);
    } catch (error) {
      console.error('Error during rollback:', error);
      setRollbackError(`Rollback to version ${versionName} failed due to a network error. Please try again.`);
    } finally {
      setRollbackingId(null);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setPanelOpened(!panelOpened)} className={`neon-admin__icon ${panelOpened ? 'is-active' : ''}`}
        aria-label="Versions history" aria-expanded={Boolean(panelOpened)} aria-controls="neon-history-panel" title="Versions history">
        <HistoryIcon size={18} />
      </button>
      {panelOpened && (
        <aside id="neon-history-panel" className="neon-history" aria-label="Versions history" data-panel="history">
          <div className="neon-history__header"><span><HistoryIcon size={17} /> Versions history <small>{versions.length}</small></span>
            <button type="button" className="neon-history__close" aria-label="Close versions history" onClick={() => setPanelOpened(false)}><X size={18} /></button>
          </div>
          <div className="neon-history__filters" aria-label="Filter versions">
            {(['all', 'live'] as const).map(value => <button key={value} type="button" aria-pressed={filter === value}
              onClick={() => setFilter(value)}>{value === 'all' ? 'All' : 'Live'}</button>)}
          </div>
          {rollbackError && <p className="neon-history__error" role="alert">{rollbackError}</p>}
          <div className="neon-history__scroll">
            {loadingHistory || isLoading ? <p className="neon-history__empty"><LoaderCircle className="animate-spin" size={20} /> Loading history…</p>
              : isError ? <div className="neon-history__empty" role="alert">Could not load versions. <button type="button" onClick={() => refetch()}>Try again</button></div>
              : !filteredVersions.length
                ? <p className="neon-history__empty">{filter === 'live' ? 'No live versions yet.' : 'No versions available.'}</p>
                : <ol className="neon-history__list">
                  {filteredVersions.map((item, filteredIndex) => {
                    const index = versions.indexOf(item);
                    const shown = item.nodeId === data.model.data.version || (viewStatus === ViewStatus.LIVE && item.nodeId === data.model.data.id);
                    const working = item.versionTimestamp === -1 || Number.isNaN(new Date(item.versionDate).getTime());
                    const previous = item.prevTsVersion ? versions.find(version => version.versionTimestamp === item.prevTsVersion) : undefined;
                    const canRollback = index > 0 && !item.live && item.nodeId !== latestEdit?.nodeId && !latestPreviewSysData?.lockedBy;
                    let href = '#';
                    try { href = new URL(item.pubInfo.canonical, 'http://localhost').pathname; }
                    catch (error) { console.warn('Invalid version URL', error); }
                    return <li key={`${item.nodeId}-${item.versionTimestamp}`}>
                      {(filteredIndex === 0 || dateGroup(item) !== dateGroup(filteredVersions[filteredIndex - 1])) &&
                        <div className="neon-history__date">{dateGroup(item)}</div>}
                      <div className={clsx('neon-history__row', {
                      'is-current': shown, 'is-live': item.live, 'is-working': working,
                    })}>
                      <Link href={href} className="neon-history__link" data-version={`${item.major}.${item.minor}`}
                        {...(previous ? { 'data-prev-version': `${previous.major}.${previous.minor}` } : {})}>
                        <div className="neon-history__row-head"><strong>{working ? 'Working copy' : `${item.major}.${item.minor}`}</strong>
                          {previous && <span>from {previous.major}.{previous.minor}</span>}
                          <span className="neon-history__badges">
                            {item.live && <b className={item === latestLive ? 'is-live' : ''}>{item === latestLive ? 'Latest published' : 'Published'}</b>}
                            {item === latestEdit && <b className="is-latest">Latest</b>}
                            {working && <b>Draft</b>}
                          </span>
                        </div>
                        {item.title && <div className="neon-history__title">{item.title}</div>}
                        <div className="neon-history__meta">
                          {!working && new Date(item.versionDate).toLocaleString()}
                          {item.live && item.pubInfo.publishedBy?.userName && <> · {item.pubInfo.publishedBy.userName}</>}
                          {item.workflowStatus && <span>{item.workflowStatus}</span>}
                        </div>
                        {shown && <div className="neon-history__viewing">Viewing in {viewStatus === ViewStatus.LIVE ? 'Live' : 'Preview'}</div>}
                      </Link>
                      {shown && canRollback && <button type="button" className="neon-history__restore" disabled={Boolean(rollbackingId)}
                        onClick={() => rollbackTo(item)}>{rollbackingId === item.nodeId ? 'Rolling back…' : 'Restore this version'}</button>}
                      </div>
                    </li>;
                  })}
                </ol>}
          </div>
        </aside>
      )}
    </>
  );
}
