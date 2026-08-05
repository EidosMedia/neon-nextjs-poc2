'use client';
import React, { useState } from 'react';
import { ArticleModel } from '@/types/models';
import useVersions from '@/hooks/useVersions';
import useAuthContext from '@/hooks/useAuthContext';
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';

type PromotionButtonProps = {
  data: ArticleModel;
  viewStatus: string;
};

const PromotionButton: React.FC<PromotionButtonProps> = ({ data, viewStatus }) => {
  const [showButton, setShowButton] = useState(true);
  const normalizedViewStatus = normalizeViewStatus(viewStatus);
  const isLive = normalizedViewStatus === ViewStatus.LIVE;
  const { data: authContext } = useAuthContext();
  const canUseVersions = normalizedViewStatus === ViewStatus.PREVIEW || authContext.hasEditorialAuth;

  const { changeEdited } = useVersions({
    currentNode: data as any,
    viewStatus: normalizedViewStatus,
    enabled: canUseVersions,
  }); // TODO: Replace 'any' with proper PageData<BaseModel> type conversion if available

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
        const respJson = await response.json();
        alert('Failed to promote: ' + respJson.error.message);
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    showButton && (
      <div className="flex items-center justify-center text-white cursor-pointer">
        <button
          className="fit-content cursor-pointer px-4 py-2 rounded-[2px] text-white bg-[#2847E2] hover:bg-[#191FBD] duration-300 ease-in-out"
          title={isLive ? 'Unpublish' : 'Publish'}
          onClick={handlePromotion}
        >
          {isLive ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    )
  );
};

export default PromotionButton;
