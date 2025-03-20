import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authSlices, getAuthData } from '@/lib/features/authSlice';
import { getVersions, getVersionsPanelOpened, setVersionPanelOpen, setVersions } from '@/lib/features/versionsSlice';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useVersions = ({ currentNode }: { currentNode: PageData<BaseModel> }) => {
  const dispatch = useDispatch();

  const versions = useSelector(getVersions(currentNode?.model.data.id));

  const loadHistory = useCallback(async () => {
    try {
      const jsonResp = await (await fetch(`/api/nodes/${currentNode.model.data.id}/versions/live`)).json();

      dispatch(
        setVersions({
          id: currentNode.model.data.id,
          versions: jsonResp.result,
        })
      );
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  const setPanelOpened = (status: boolean) => {
    dispatch(setVersionPanelOpen(status));
  };

  const panelOpened = useSelector(getVersionsPanelOpened);

  console.log('panelOpened', panelOpened);

  useEffect(() => {
    if (currentNode) {
      loadHistory();
    }
  }, [currentNode]);

  return { data: versions || [], panelOpened, setPanelOpened };
};

export default useVersions;
