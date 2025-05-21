import Publish from '@/app/components/icons/publish';
import Unpublish from '@/app/components/icons/unpublish';
import { Info } from 'lucide-react';
import ArticleInfo from './ArticleInfo';
import { OverlayDataObj } from '../ArticleOverlay';
import { useState, useRef, useEffect } from 'react';

type ArticleActionsProps = {
  data: any;
  viewStatus: string;
  overlayData: OverlayDataObj;
  width?: 'normal' | 'max';
};

const ArticleActions: React.FC<ArticleActionsProps> = ({ data, viewStatus, overlayData, width }) => {
  const isLive = viewStatus === 'LIVE';
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  // Hide ArticleInfo when clicking outside, mouse leaves ArticleInfo, or Overlay is hidden/moved out
  useEffect(() => {
    if (!showInfo) return;

    const handleClick = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };

    // Hide ArticleInfo when Overlay (container) is hidden or mouse leaves Overlay
    const overlayDiv = infoRef.current?.closest('.group');
    const handleOverlayMouseLeave = () => setShowInfo(false);

    document.addEventListener('mousedown', handleClick);
    if (overlayDiv) {
      overlayDiv.addEventListener('mouseleave', handleOverlayMouseLeave);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      if (overlayDiv) {
        overlayDiv.removeEventListener('mouseleave', handleOverlayMouseLeave);
      }
    };
  }, [showInfo]);

  const handleInfoMouseLeave = () => {
    setShowInfo(false);
  };

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
    <>
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
        <button className="text-white w-3 h-3 cursor-pointer" title="Info" onClick={() => setShowInfo(v => !v)}>
          <Info />
        </button>
      </div>
      {showInfo && (
        <div ref={infoRef} onMouseLeave={handleInfoMouseLeave}>
          <ArticleInfo overlayData={overlayData} width={width} />
        </div>
      )}
    </>
  );
};

export default ArticleActions;
