import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVersions, getVersionsPanelOpened, setVersionPanelOpen, setVersions } from '@/lib/features/versionsSlice';
import { BaseModel, NodeVersion, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useVersions = ({ currentNode }: { currentNode?: PageData<BaseModel> }) => {
  const dispatch = useDispatch();

  const versions = useSelector(getVersions(currentNode?.model?.data?.id || '')) || [];

  const currentModelIdRef = useRef<string>('');

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/nodes/${currentNode?.model.data.id}/versions`);
      const jsonResp = await response.json();

      let filteredVersions: NodeVersion[];
      if (currentNode?.siteData.viewStatus === 'PREVIEW') {
        filteredVersions = jsonResp.result.filter((item: NodeVersion) => item.versionTimestamp != '-1');
      } else {
        filteredVersions = jsonResp.result.filter((item: NodeVersion) => item.live && item.versionTimestamp != '-1');
      }

      dispatch(
        setVersions({
          id: currentNode?.model.data.id,
          versions: filteredVersions,
        })
      );
    } catch (error) {
      console.log('error', error);
    }
  };

  const setPanelOpened = (status: boolean) => {
    dispatch(setVersionPanelOpen(status));
  };

  const panelOpened = useSelector(getVersionsPanelOpened);

  useEffect(() => {
    if (
      currentNode &&
      currentNode.model &&
      currentNode.model.id &&
      currentNode?.model.data.id &&
      currentModelIdRef.current !== currentNode.model.id
    ) {
      currentModelIdRef.current = currentNode.model.id;
      loadHistory();
    }
  }, [currentNode?.model?.id]);

  const getVersion = (canonicalUrl: string) => {
    if (versions.length === 0) {
      return 'LIVE';
    }

    if (currentNode?.model.data.url === new URL(versions[0]?.pubInfo.canonical).pathname) {
      return 'LIVE';
    }

    const versionToBeProcessed = versions.find((version: NodeVersion) => version.pubInfo.canonical === canonicalUrl);
    return `${versionToBeProcessed?.major}.${versionToBeProcessed?.minor}`;
  };

  const getCurrentLiveVersion = () => {
    return versions[0];
  };

  return { data: versions, panelOpened, setPanelOpened, getVersion, getCurrentLiveVersion };
};

export default useVersions;
