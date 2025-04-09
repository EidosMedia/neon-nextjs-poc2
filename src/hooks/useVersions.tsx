import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVersions, getVersionsPanelOpened, setVersionPanelOpen, setVersions } from '@/lib/features/versionsSlice';
import { BaseModel, NodeVersion, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useVersions = ({ currentNode }: { currentNode: PageData<BaseModel> }) => {
  const dispatch = useDispatch();

  const versions = useSelector(getVersions(currentNode?.model.data.id)) || [];

  const loadHistory = async () => {
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
  };

  const setPanelOpened = (status: boolean) => {
    dispatch(setVersionPanelOpen(status));
  };

  const panelOpened = useSelector(getVersionsPanelOpened);

  useEffect(() => {
    if (currentNode) {
      loadHistory();
    }
  }, [currentNode]);

  const getVersion = (canonicalUrl: string) => {
    if (versions.length === 0) {
      return 'LIVE';
    }
    if (currentNode.model.data.url === versions[0]?.pubInfo.canonical) {
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
