import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';
import Link from 'next/link';
import { LoggedUserBarProps } from './LoggedUserOverlay.types';

const ViewStatus: React.FC<LoggedUserBarProps> = ({ data }) => {
  const { getVersionLabelFromVersion, getLatestViewVersion } = useVersions({
    currentNode: 'model' in data ? data : undefined,
  });

  const version = getVersionLabelFromVersion(
    'model' in data && data.model?.data?.version
      ? data.model.data.version
      : data.siteData.viewStatus === 'LIVE' && 'model' in data && data.model?.data?.id
      ? data.model.data.id
      : '',
    data.siteData.viewStatus
  );

  const isLastPreview = version === 'PREVIEW';
  const isLastLive = version === 'LIVE';

  const isPreview = version.startsWith('PREVIEW');
  const isLive = version.startsWith('LIVE');

  const colorClass = () => {
    if (isLastLive || isLive) {
      return 'bg-(--color-live-background)';
    }
    if (isLastPreview) {
      return 'bg-gray-600';
    }
    return 'bg-gray-300';
  };

  return (
    <div className={clsx('flex items-center justify-center text-white px-5 h-16', colorClass())}>
      {isLastLive || isLastPreview ? (
        version
      ) : (
        <div className="flex flex-col justify-center items-center">
          <span className="text-black font-semibold text-">{version}</span>
          <Link href={getLatestViewVersion(data.siteData.viewStatus).pubInfo.canonical}>
            <span className="text-black underline font-medium">Back to latest version</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewStatus;
