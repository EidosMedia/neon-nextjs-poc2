import Publish from '@/app/components/icons/publish';
import Unpublish from '@/app/components/icons/unpublish';

type ArticleActionsProps = {
  data: any;
  viewStatus: string;
};

const ArticleActions: React.FC<ArticleActionsProps> = ({ data, viewStatus }) => {
  const isLive = viewStatus === 'LIVE';

  const handlePromotion = async () => {
    try {
      const response = await fetch(`/api/contents`, {
        method: isLive ? 'DELETE' : 'POST', // Call this based on if the content is already promoted or not
        body: JSON.stringify({ id: data.id }),
      });
      if (response.ok) {
        document.location.reload();
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div
      className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 -translate-y-5 z-10 h-8 bg-gray-700 px-4 py-2.5 shadow-lg rounded-xs
    group hidden group-hover:flex group-hover:gap-4"
    >
      <button
        className="text-white w-3 h-3 cursor-pointer"
        title={isLive ? 'Unpublish' : 'Publish'}
        onClick={handlePromotion}
      >
        {isLive ? <Unpublish /> : <Publish />}
      </button>
    </div>
  );
};

export default ArticleActions;
