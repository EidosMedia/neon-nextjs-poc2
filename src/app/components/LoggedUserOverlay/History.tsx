import { useEffect, useState } from 'react';
import Clock from '../icons/clock';
import { NodeVersion, PageNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import Close from '../icons/close';
import useVersions from '@/hooks/useVersions';

type VersionsResponse = {
  result: NodeVersion[];
};

type UserLayerProps = {
  data: PageNode;
};

const History: React.FC<UserLayerProps> = ({ data }) => {
  const [historyContent, setHistoryContent] = useState<NodeVersion[]>([]);

  const {
    data: versionsData,
    setPanelOpened,
    panelOpened,
  } = useVersions({
    currentNode: data,
  });

  console.log('panelOpened', panelOpened);

  console.log('versionsData', versionsData);

  return (
    <>
      <a
        onClick={() => setPanelOpened((state) => !state)}
        className="flex items-center justify-center text-white cursor-pointer"
      >
        <Clock />
      </a>
      {panelOpened && (
        <div className="h-screen w-xs absolute text-black top-0 right-0 z-10">
          <div className="text-black relative h-fit mt-16">
            <div className="flex items-center justify-between py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-2 text-(--color-switch-checked-background)">
                <Clock />
                <span>Versions history</span>
              </span>
              <a
                onClick={() => setPanelOpened(false)}
                className="cursor-pointer"
              >
                <Close />
              </a>
            </div>
            <ol className="relative border-s border-gray-200 dark:border-gray-700">
              {versionsData.map((item: NodeVersion) => (
                <li className="mb-10 ms-4" key={item.nodeId}>
                  <div className="absolute w-5 h-5 bg-gray-200 rounded-full mt-2.5 -start-2.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                    <Link href={item.pubInfo.canonical || '#'}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {`Version ${item.major}.${item.minor}`}
                      </h3>
                    </Link>
                    <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                      Missing user data
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

export default History;
