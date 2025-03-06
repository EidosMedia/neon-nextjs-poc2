import clsx from 'clsx';

const ViewStatus = ({ data }) => {
  const isLive = data.siteData.viewStatus === 'LIVE';

  return (
    <div
      className={clsx(
        'flex items-center justify-center text-white p-5',
        isLive ? 'bg-(--color-live-background)' : 'bg-red-500'
      )}
    >
      {isLive ? 'LIVE' : 'PREVIEW'}
    </div>
  );
};

export default ViewStatus;
