import useVersions from '@/hooks/useVersions';
import {
  getInspectItems,
  loggedUserSlice,
  setInspectItems as setInspectItemsAction,
} from '@/lib/features/loggedUserSlice';
import { BaseModel, NodeVersion, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import Close from '../icons/close';
import { useEffect } from 'react';

type UserLayerProps = {
  data: PageData<BaseModel>;
};

const History: React.FC<UserLayerProps> = ({ data }) => {
  const {
    data: historyData,
    setPanelOpened,
    panelOpened,
  } = useVersions({
    currentNode: data.model.data,
    viewStatus: data.siteData.viewStatus,
  });

  console.log('data in history', data);

  const dispatch = useDispatch();

  const inspectItems = useSelector(getInspectItems);

  function removeDashNumber(url?: string) {
    if (!url) return '';
    return url.replace(/(-n?\d{10,20})(?=\/|$)/, '');
  }

  async function rollbackTo(nodeId: string, baseType: string, versionName: string) {
    if (confirm(`Are you sure you want to Rollback to version ${versionName}`)) {
      // go to roll back!

      const response = await fetch(`/api/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: nodeId,
          baseType: baseType,
        }),
      });
      if (response.ok) {
        response.json().then(rollbacked => {
          console.log('Rollbacked TO version ', versionName, ' with new node:', rollbacked.nodeRef);

          window.location.href = removeDashNumber(window.location.href).replace(
            removeDashNumber(data.model.data.id),
            rollbacked.nodeRef
          );
        });
      } else {
        console.error('Failed to rollback version with response:', response);
      }
    } else {
      // Do nothing!
      console.log('roll back not confirmed');
    }
  }

  function getPrevVersionName(prevTsVersion: number) {
    if (!prevTsVersion) {
      return null;
    }
    const prevVersion =
      Array.isArray(historyData.versions) &&
      historyData.versions.find((v: NodeVersion) => v.versionTimestamp === prevTsVersion);
    if (prevVersion) {
      return `${prevVersion.major}.${prevVersion.minor}`;
    }

    return null;
  }

  const latestLiveVersionIndex = historyData?.versions
    ? historyData.versions.findIndex((v: NodeVersion) => v.live)
    : -1;

  const viewStatus = data.siteData.viewStatus || 'LIVE';

  const latestEditNodeVersion: NodeVersion =
    historyData?.versions?.find((v: NodeVersion) => v.live === false && v.versionTimestamp !== -1) ||
    ({
      nodeId: '',
      major: 0,
      minor: 0,
      pubInfo: { canonical: '', publicationTime: '', publishedBy: { userName: '' } },
      live: false,
      versionTimestamp: -1,
      prevTsVersion: 0,
    } as NodeVersion);

  useEffect(() => {
    if (
      historyData?.versions &&
      historyData.versions.length > 0 &&
      latestEditNodeVersion.nodeId === data.model.data.version
    ) {
      dispatch(setInspectItemsAction(true));
    } else if (inspectItems) {
      dispatch(setInspectItemsAction(false));
    }
  }, [historyData, latestEditNodeVersion, data.model.data.version]);

  const getVersionNameFromItem = (item: NodeVersion) => {
    return `${item.major}.${item.minor}`;
  };

  return (
    <>
      <a
        onClick={() => setPanelOpened(!panelOpened)}
        className="flex items-center justify-center text-white cursor-pointer"
        aria-label="Versions history"
      >
        <Clock />
      </a>
      {panelOpened && (
        <div
          className="min-w-xs absolute text-black top-[56px] right-0 z-10 flex flex-col"
          style={{ height: 'calc(100vh - 56px)' }}
          data-panel="history"
        >
          <div className="text-black relative grow-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-2 text-(--color-panel-text-header) ml-1">
                <Clock />
                <span>Versions history</span>
              </span>
              <a onClick={() => setPanelOpened(false)} className="cursor-pointer mr-1">
                <Close />
              </a>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-900 grow-1 min-h-0 overflow-y-auto">
              <ol className="relative border-s border-gray-300 dark:border-gray-200 list-none">
                {historyData &&
                  historyData.versions &&
                  historyData.versions.map((item: NodeVersion, index: number) => {
                    const rewrittenPath = new URL(item.pubInfo.canonical, window.location.origin).pathname;
                    const modelPathName = data.model.data.url;

                    const isVersionShown = item.nodeId === data.model.data.version;
                    const isLatestLiveVersion = item.live && latestLiveVersionIndex === index;
                    const isLatestPreviewVersion = !item.live && latestEditNodeVersion?.nodeId === item.nodeId;

                    return (
                      <li className="mb-10 ms-4" key={item.nodeId}>
                        <div
                          className={clsx(
                            'absolute w-5 h-5 rounded-full mt-0 -start-2.5 border border-white dark:border-gray-900 dark:bg-gray-700',
                            isVersionShown ? 'bg-gray-600' : 'bg-gray-300'
                          )}
                        ></div>
                        <div className="relative flex flex-1 min-w-0">
                          <Link
                            href={rewrittenPath || '#'}
                            className="flex-1 min-w-0"
                            data-version={`${item.major}.${item.minor}`}
                            {...(getPrevVersionName(item.prevTsVersion)
                              ? { 'data-prev-version': getPrevVersionName(item.prevTsVersion) }
                              : {})}
                          >
                            <div className={clsx('p-4 rounded-sm mr-1 ', isVersionShown ? 'bg-blue-100' : 'bg-white')}>
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {`Version ${item.major}.${item.minor}`}
                                  {(() => {
                                    const prevVersionName = getPrevVersionName(item.prevTsVersion);
                                    return prevVersionName ? ` from ${prevVersionName}` : '';
                                  })()}
                                </h3>

                                {viewStatus === 'LIVE' ? (
                                  <div
                                    className={clsx(
                                      'text-xs text-green-600 bg-green-100 border border-green-600 rounded-full px-2 py-0.5',
                                      isLatestLiveVersion ? 'font-bold' : 'font-normal'
                                    )}
                                  >
                                    {latestLiveVersionIndex === index ? 'LATEST' : 'LIVE version'}
                                  </div>
                                ) : item.live ? (
                                  <div className="text-xs text-green-600 bg-green-100 border border-green-600 rounded-full px-2 py-0.5 font-normal">
                                    {'LIVE version'}
                                  </div>
                                ) : (
                                  isLatestPreviewVersion && (
                                    <div
                                      className={clsx(
                                        'text-xs text-pink-300 bg-pink-100 border border-pink-300 rounded-full px-2 py-0.5',
                                        'font-bold'
                                      )}
                                    >
                                      {'LATEST'}
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="flex items-center justify-between ">
                                <div className="mb-4 font-normal text-gray-500 dark:text-gray-400">
                                  {new Date(item.versionDate).toLocaleString()}
                                  {item.workflowStatus && <div>{item.workflowStatus}</div>}
                                  {item.pubInfo.publishedBy && <div>Edited by {item.pubInfo.publishedBy.userName}</div>}
                                </div>
                              </div>
                            </div>
                          </Link>
                          {index > 0 && !item.live && !data.model.data.sys.lockedBy && (
                            <button
                              className="z-20 absolute right-2 bottom-2 fit-content cursor-pointer px-2 py-1 rounded-[2px] text-white bg-[#2847E2] hover:bg-[#191FBD] duration-300 ease-in-out"
                              title="Rollback to this version"
                              onClick={e => {
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                rollbackTo(item.nodeId, data.model.data.sys.baseType, `${item.major}.${item.minor}`);
                              }}
                            >
                              Rollback
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default History;
