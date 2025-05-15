'use client';
import React, { useState } from 'react';
import { ArticleModel } from '@/types/models';
import useAuth from '@/hooks/useAuth';
import { Download, Rocket, Upload, X } from 'lucide-react';

type PromotionButtonProps = {
  data: ArticleModel;
  viewStatus: string;
};

const PromotionButton: React.FC<PromotionButtonProps> = ({ data, viewStatus }) => {
  const [showButton, setShowButton] = useState(true);
  const isLive = viewStatus === 'LIVE';
  const { data: authData } = useAuth();

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

  const isUserLogged = authData.user?.name !== undefined;

  return (
    isUserLogged &&
    showButton && (
      <div
        className="flex items-center justify-center text-white cursor-pointer"
        onClick={handlePromotion}
      >
          {/* {isLive ? <X /> : <Rocket />} */}
            
          {/* <span className='flex gap-3 bg-sky-600 px-4 py-2 text-white items-center rounded-lg' >
            Publish{isLive ? <Download /> : <Upload />}
          </span> */}

    <button className="bg-[#414ACF] text-white fit-content cursor-pointer px-4 py-2 rounded-[2px]" title={isLive ? 'Unpkublish' : 'Publish'} onClick={handlePromotion}>
        {isLive ? 'Unpublish' : 'Publish'}
      </button>
      </div>
    )
  );
};

export default PromotionButton;
