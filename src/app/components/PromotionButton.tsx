'use client';
import React, { useState } from 'react';
import { ArticleModel } from '@/types/models';

type PromotionButtonProps = {
  data: ArticleModel;
  viewStatus: string;
};

const PromotionButton: React.FC<PromotionButtonProps> = ({ data, viewStatus }) => {
  const [showButton, setShowButton] = useState(true);
  const isLive = viewStatus === 'LIVE';

  const handlePromotion = async () => {
    try {
      const response = await fetch(`/api/contents`, {
        method: isLive ? 'DELETE' : 'POST', // Call this based on if the content is already promoted or not
        body: JSON.stringify({ id: data.id }),
      });
      if (response.ok) {
        setShowButton(false); // Hide the button after content promotion
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    showButton && (
      <div
        className="absolute bottom-8 right-8 p-4 bg-red-500 active:bg-red-400 rounded-lg shadow-md cursor-pointer"
        onClick={handlePromotion}
      >
        <span className="flex items-center text-white uppercase font-semibold">
          {isLive ? 'Unpublish' : 'Promote pending changes'}
        </span>
      </div>
    )
  );
};

export default PromotionButton;
