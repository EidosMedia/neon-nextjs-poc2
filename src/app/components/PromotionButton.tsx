'use client';
import React, { useState } from 'react';
import { ArticleModel } from '@/types/models';
import useAuth from '@/hooks/useAuth';
import useVersions from '@/hooks/useVersions';

type PromotionButtonProps = {
  data: ArticleModel;
  viewStatus: string;
};

const PromotionButton: React.FC<PromotionButtonProps> = ({ data, viewStatus }) => {
  const [showButton, setShowButton] = useState(true);
  const isLive = viewStatus === 'LIVE';
  const { data: authData } = useAuth();

  const { changeEdited } = useVersions({ currentNode: data as any, viewStatus }); // TODO: Replace 'any' with proper PageData<BaseModel> type conversion if available

  const handlePromotion = async () => {
    try {
      const response = await fetch(`/api/contents`, {
        method: isLive ? 'DELETE' : 'POST', // Call this based on if the content is already promoted or not
        body: JSON.stringify({ id: data.id }),
      });
      if (response.ok) {
        changeEdited(false);
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
      <div className="flex items-center justify-center text-white cursor-pointer">
        <button
          className="fit-content cursor-pointer px-4 py-2 rounded-[2px] text-white bg-[#2847E2] hover:bg-[#191FBD] duration-300 ease-in-out"
          title={isLive ? 'Unpkublish' : 'Publish'}
          onClick={handlePromotion}
        >
          {isLive ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    )
  );
};

export default PromotionButton;
