import { useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import {
  getHistory,
  getLoadingHistory,
  getVersionsPanelOpened,
  setVersionPanelOpen,
  setHistory,
  getEdited,
  setLoadingHistory,
  setEdited as setEditedAction,
} from '@/lib/features/versionsSlice';
import { BaseModel, NodeHistory, NodeVersion, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useVersions = ({ currentNode, viewStatus }: { currentNode?: BaseModel; viewStatus?: string }) => {
  const dispatch = useDispatch();
  const history: NodeHistory = useSelector(getHistory(currentNode?.id || ''));
  const store = useStore();
  //const viewStatus = useSelector(getViewStatus);

  const currentModelIdRef = useRef<string | undefined>(undefined);

  const loadHistory = async () => {
    try {
      const now: number = new Date().getTime();
      const lastLoadingHistory: number = getLoadingHistory(currentNode?.id || '')(store.getState());

      const elapsedtime = now - lastLoadingHistory;
      // If the last loading was less than 5 second ago, skip the request
      if (now - lastLoadingHistory < 1000) {
        console.log('skip request loading due to elaspsed', elapsedtime, 'ms');
        return;
      }

      dispatch(
        setLoadingHistory({
          id: currentNode?.id,
          lastAcquire: now,
        })
      );

      const versionFetchUrl: string =
        viewStatus === 'LIVE'
          ? `/api/nodes/${currentNode?.id}/versions/live`
          : `/api/nodes/${currentNode?.id}/versions`;

      const response = await fetch(versionFetchUrl);
      const jsonResp = await response.json();

      let filteredVersions: NodeVersion[];
      if (viewStatus === 'PREVIEW') {
        filteredVersions = jsonResp.result.filter((item: NodeVersion) => item.versionTimestamp !== -1);
      } else {
        filteredVersions = jsonResp.result.filter((item: NodeVersion) => item.live && item.versionTimestamp != -1);
      }

      dispatch(
        setHistory({
          id: currentNode?.id,
          version: currentNode?.version,
          acquireTimestamp: now,
          versions: filteredVersions,
        })
      );
    } catch (error) {
      console.log('error', error);
    }
  };

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

    // Only run loadHistory if modelChanged or edited, and prevent multiple calls in quick succession
    if (edited || modelChanged) {
      loadHistory();
    }
  }, [currentNode?.id, edited, viewStatus]);

  const getVersionLabelFromVersion = (nodeVersion: string, viewStatus: string) => {
    if (!history?.versions || history.versions.length === 0) {
      return viewStatus; // while not loaded
    }

    const dashCount = (nodeVersion.match(/-/g) || []).length;
    const isVersion = dashCount === 4;
    const isEditVersion = isVersion && nodeVersion.includes('-n');
    const firstLiveVersion = history.versions.findIndex((version: NodeVersion) => version.live === true);
    const firstEditVersion = history.versions.findIndex((version: NodeVersion) => version.nodeId.includes('-n'));

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
        if (versionIndex === firstLiveVersion) return 'LIVE';
        else return `LIVE ${versionObj.major}.${versionObj.minor}`;
      }
    }

    if (!currentNode?.version) {
      return 'LIVE';
    }

    return viewStatus;
  };

  const getLatestViewVersion = (viewStatus: string): NodeVersion => {
    switch (viewStatus) {
      case 'PREVIEW':
        return (
          history.versions.find((version: NodeVersion) => version.live === false && version.versionTimestamp !== -1) ||
          history.versions[0]
        );
      case 'LIVE':
        return (
          history.versions.find((version: NodeVersion) => version.live === true && version.versionTimestamp !== -1) ||
          history.versions[0]
        );
      default:
        console.warn('Unknown viewStatus', viewStatus, 'using first version', history.versions[0]);
        return history.versions[0];
    }
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
