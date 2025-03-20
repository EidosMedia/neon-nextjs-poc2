import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authSlices, getAuthData } from '@/lib/features/authSlice';
import { NodeVersion } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getVersions, setVersions } from '@/lib/features/versionsSlice';

const useVersions = ({ currentNode }) => {
  const dispatch = useDispatch();
  const [historyContent, setHistoryContent] = useState<NodeVersion[]>([]);
  const [panelOpened, setPanelOpened] = useState(false);

  const versions = useSelector(getVersions(currentNode?.model.data.id));
  const getUserFromBackend = async () => {
    const authResp = await (await fetch('/api/users')).json();
    dispatch(authSlices.actions.setAuthData(authResp));
  };
  const loadHistory = async () => {
    try {
      const jsonResp: VersionsResponse = await (
        await fetch(`/api/nodes/${currentNode.model.data.id}/versions/live`)
      ).json();
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

  useEffect(() => {
    if (currentNode) {
      loadHistory();
    }
  }, [currentNode]);

  return { data: versions || [], panelOpened, setPanelOpened };
};

export default useVersions;
