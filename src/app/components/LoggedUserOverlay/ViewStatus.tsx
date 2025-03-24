import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';
import Link from 'next/link';

const ViewStatus = ({ data }) => {
  const { getVersion, getCurrentLiveVersion } = useVersions({
    currentNode: data,
  });

  const isPreview = data.siteData.viewStatus === 'PREVIEW';
  const version = isPreview ? 'PREVIEW' : getVersion(data.model.data.url);
  const isLive = version ? version === 'LIVE' : data.siteData.viewStatus;

  const colorClass = () => {
    if (isLive) {
      return 'bg-(--color-live-background)';
    }
    if (isPreview) {
      return 'bg-red-500';
    }
    return 'bg-gray-100';
  };

  return (
    <div className={clsx('flex items-center justify-center text-white px-5 h-16', colorClass())}>
      {isLive || isPreview ? (
        version
      ) : (
        <div className="flex flex-col">
          <span className="text-black">Version {version}</span>
          <Link href={getCurrentLiveVersion().pubInfo.canonical}>
            <span className="text-black underline">Back to live version</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewStatus;
