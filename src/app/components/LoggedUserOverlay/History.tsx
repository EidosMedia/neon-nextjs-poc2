import Clock from '../icons/clock';
import { BaseModel, NodeVersion, PageData, PageNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import Close from '../icons/close';
import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';

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

  return (
    <>
      <a
        onClick={() => setPanelOpened(!panelOpened)}
        className="flex items-center justify-center text-white cursor-pointer"
      >
        <Clock />
      </a>
      {panelOpened && (
        <div className="h-screen w-xs absolute text-black top-0 right-0 z-10 flex flex-col">
          <div className="h-16"></div>
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
            <div className="p-4 bg-gray-100 dark:bg-gray-900 grow-1 min-h-0">
              <ol className="relative border-s border-gray-300 dark:border-gray-700">
                {versionsData.map((item: NodeVersion) => (
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {`Version ${item.major}.${item.minor} - ${item.live ? 'live' : 'preview'}`}
                        </h3>
                        <p className="mb-4 font-normal text-gray-500 dark:text-gray-400">
                          {new Date(item.pubInfo.publicationTime).toLocaleString()}
                        </p>
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
