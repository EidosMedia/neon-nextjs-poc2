import { useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import {
  getVersionsPanelOpened,
  setVersionPanelOpen,
  getEdited,
  setEdited as setEditedAction,
} from '@/lib/features/versionsSlice';
import { BaseModel, NodeHistory, NodeVersion } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { useQuery } from '@tanstack/react-query';
import { getFamilyRef } from '@/utilities/content';

const useVersions = ({ currentNode, viewStatus }: { currentNode?: BaseModel; viewStatus?: string }) => {
  const dispatch = useDispatch();

  const fetchQueries = async () => {
    const versionFetchUrl: string =
      viewStatus === 'LIVE' ? `/api/nodes/${currentNode?.id}/versions/live` : `/api/nodes/${currentNode?.id}/versions`;

    const response = await fetch(versionFetchUrl);
    const jsonResp = await response.json();
    return { versions: jsonResp.result as NodeVersion[], count: jsonResp.count as number };
  };

  // Queries
  const { data, refetch } = useQuery({
    queryKey: ['versions', getFamilyRef(currentNode?.id || ''), viewStatus],
    queryFn: fetchQueries,
    enabled: !!currentNode?.id && currentNode.sys.baseType !== 'site' && currentNode.sys.baseType !== 'section',
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const history: Partial<NodeHistory> = data ?? {};

  const currentModelIdRef = useRef<string | undefined>(undefined);

  const setEdited = (value: boolean) => {
    dispatch(setEditedAction(value));
  };

  const setPanelOpened = (status: boolean) => {
    dispatch(setVersionPanelOpen(status));
  };

  const panelOpened = useSelector(getVersionsPanelOpened);
  const edited = useSelector(getEdited);

  useEffect(() => {
    let modelChanged = false;
    const versionFromCurrentNode = currentNode?.version;

    if (currentNode && currentNode.id && currentModelIdRef.current !== versionFromCurrentNode) {
      currentModelIdRef.current = versionFromCurrentNode;
      modelChanged = true;
    }

    // Only run refetch if modelChanged or edited
    if (edited) {
      console.log('calling refetch');
      refetch();
    }
  }, [currentNode?.id, edited, viewStatus]);

  const getVersionLabelFromVersion = (nodeVersion: string, viewStatus: string) => {
    if (!history?.versions || history.versions.length === 0) {
      return viewStatus; // while not loaded
    }

    const dashCount = (nodeVersion.match(/-/g) || []).length;
    const isVersion = dashCount === 4;
    const isEditVersion = isVersion && nodeVersion.includes('-n');
    const firstLiveVersion = history.versions.findIndex((version: NodeVersion) => version.live);
    const firstEditVersion = history.versions.findIndex(
      (version: NodeVersion) => !version.live && version.versionTimestamp !== -1,
    );

    if (isVersion) {
      const versionIndex = history.versions.findIndex((version: NodeVersion) => version.nodeId === nodeVersion);
      if (versionIndex === -1) {
        console.warn('not able to identify the nodeVersion', nodeVersion, 'in versions', history.versions);
        return 'not found version';
      }
      const versionObj = history.versions[versionIndex];

      if (isEditVersion) {
        if (versionIndex === firstEditVersion) return 'PREVIEW';
        else return `PREVIEW ${versionObj.major}.${versionObj.minor}`;
      } else {
        if (viewStatus === 'LIVE' && versionIndex === firstLiveVersion) return 'LIVE';
        else return `LIVE ${versionObj.major}.${versionObj.minor}`;
      }
    }

    if (!currentNode?.version) {
      return 'LIVE';
    }

    return viewStatus;
  };

  const getLatestViewVersion = (viewStatus: string): NodeVersion => {
    let version: NodeVersion | undefined;
    switch (viewStatus) {
      case 'PREVIEW':
        version =
          history.versions?.find((version: NodeVersion) => !version.live && version.versionTimestamp !== -1) ||
          history.versions?.[0];
        break;
      case 'LIVE':
        version =
          history.versions?.find((version: NodeVersion) => version.live && version.versionTimestamp !== -1) ||
          history.versions?.[0];
        break;
      default:
        console.warn('Unknown viewStatus', viewStatus, 'using first version', history.versions?.[0]);
        version = history.versions?.[0];
        break;
    }
    if (!version) {
      throw new Error('No NodeVersion found in history');
    }
    return version;
  };

  const changeEdited = (value: boolean) => {
    setEdited(value);
  };

  return {
    data: history,
    panelOpened,
    edited,
    setPanelOpened,
    getVersionLabelFromVersion,
    getLatestViewVersion,
    changeEdited,
  };
};

export default useVersions;
