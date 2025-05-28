import { BaseModel, NeonConnection, NodeVersion, PageData, PageNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import Close from '../icons/close';
import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';
import { Clock } from 'lucide-react';
import { url } from 'inspector';

type UserLayerProps = {
  data: PageData<BaseModel>;
};

const History: React.FC<UserLayerProps> = ({ data }) => {
  const {
    data: versionsData,
    setPanelOpened,
    panelOpened,
  } = useVersions({
    currentNode: data,
  });

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
        console.log('Rollbacked TO version ', versionName, ' with response:', response);
        window.location.reload();
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
    const prevVersion = versionsData.find((v: NodeVersion) => v.versionTimestamp === prevTsVersion)));
    if (prevVersion) {
      return `${prevVersion.major}.${prevVersion.minor}`;
    }

    return null;
  }
  return (
    <>
      <a
        onClick={() => setPanelOpened(!panelOpened)}
        className="flex items-center justify-center text-white cursor-pointer"
      >
        <Clock />
      </a>
      {panelOpened && (
        <div className="h-screen w-xs absolute text-black top-0 right-0 z-10 grid">
          <div className="h-[56px]"></div>
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
              <ol className="relative border-s border-gray-300 dark:border-gray-700">
                {versionsData.map((item: NodeVersion, index: number) => (
                  <li className="mb-10 ms-4" key={item.nodeId}>
                    <div
                      className={clsx(
                        'absolute w-5 h-5 rounded-full mt-0 -start-2.5 border border-white dark:border-gray-900 dark:bg-gray-700',
                        item.pubInfo.canonical === data.model.data.url ? 'bg-gray-400' : 'bg-gray-300'
                      )}
                    ></div>
                    <Link href={item.pubInfo.canonical || '#'}>
                      <div
                        className={clsx(
                          'p-4 rounded-sm mr-4 ',
                          item.pubInfo.canonical === data.model.data.url ? 'bg-blue-100' : 'bg-white'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {`Version ${item.major}.${item.minor}`}
                            {(() => {
                              const prevVersionName = getPrevVersionName(item.prevTsVersion);
                              return prevVersionName ? ` from ${prevVersionName}` : '';
                            })()}
                          </h3>
                          {item.live && (
                            <div className="text-xs font-bold text-green-600 bg-green-100 border border-green-600 rounded-full px-2 py-0.5">
                              LIVE
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between ">
                          <p className="mb-4 font-normal text-gray-500 dark:text-gray-400">
                            {new Date(item.pubInfo.publicationTime).toLocaleString()}
                            <br />
                            {item.workflowStatus && <span>{item.workflowStatus}</span>}
                          </p>
                          <button
                            className="z-10 fit-content cursor-pointer px-2 py-1 rounded-[2px] text-white bg-[#2847E2] hover:bg-[#191FBD] duration-300 ease-in-out mb-2"
                            title="Rollback to this version"
                            onClick={e => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                              rollbackTo(item.nodeId, data.model.data.sys.baseType, `${item.major}.${item.minor}`);
                            }}
                          >
                            Rollback
                          </button>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default History;
