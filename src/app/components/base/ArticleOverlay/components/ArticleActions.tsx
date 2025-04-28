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
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-5 z-10 bg-white shadow-lg border border-gray-300 rounded-xs h-5 group hidden group-hover:block">
      <button className="bg-gray-700 text-white w-5 h-5 cursor-pointer p-1" title="Unpublish" onClick={handlePromotion}>
        {isLive ? <Unpublish /> : <Publish />}
      </button>
    </div>
  );
};

export default ArticleActions;
