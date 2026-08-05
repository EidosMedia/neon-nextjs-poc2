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
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useVersions = ({
  currentNode,
  viewStatus,
  notLoadOnInit,
  enabled = true,
}: {
  currentNode?: BaseModel;
  viewStatus?: ViewStatus | string;
  notLoadOnInit?: boolean;
  enabled?: boolean;
}) => {
  const dispatch = useDispatch();
  const normalizedViewStatus = normalizeViewStatus(viewStatus);

  const fetchQueries = async () => {
    const versionFetchUrl: string =
      normalizedViewStatus === ViewStatus.LIVE
        ? `/api/nodes/${currentNode?.id}/versions/live`
        : `/api/nodes/${currentNode?.id}/versions`;

    const response = await fetch(versionFetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.status}`);
    }
    const jsonResp = await response.json();
    return { versions: jsonResp.result as NodeVersion[], count: jsonResp.count as number };
  };

  // Queries
  const { data, refetch } = useQuery({
    queryKey: ['versions', getFamilyRef(currentNode?.id || ''), normalizedViewStatus],
    queryFn: fetchQueries,
    enabled:
      enabled &&
      !!currentNode?.id &&
      currentNode.sys.baseType !== 'site' &&
      currentNode.sys.baseType !== 'section' &&
      !notLoadOnInit,
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
    if (enabled && edited) {
      console.log('calling refetch');
      refetch();
    }
  }, [currentNode?.id, edited, normalizedViewStatus, enabled]);

  const getVersionLabelFromVersion = (nodeVersion: string, currentViewStatus: ViewStatus | string) => {
    const normalizedCurrentViewStatus = normalizeViewStatus(currentViewStatus);

    if (!history?.versions || history.versions.length === 0) {
      return normalizedCurrentViewStatus; // while not loaded
    }

    const dashCount = (nodeVersion.match(/-/g) || []).length;
    const isVersion = dashCount === 4;
    const isEditVersion = isVersion && nodeVersion.includes('-n');
    const firstLiveVersion = history.versions.findIndex((version: NodeVersion) => version.live);
    const firstEditVersion = history.versions.findIndex(
      (version: NodeVersion) => !version.live && version.versionTimestamp !== -1,
    );
    const myCheckoutEditVersion = nodeVersion.endsWith('-n1'); // only user that has exclusive lock can obtain in read the checkout private node (-1)

    if (isVersion) {
      const versionIndex = history.versions.findIndex(
        (version: NodeVersion) =>
          version.nodeId === nodeVersion &&
          ((myCheckoutEditVersion && version.versionTimestamp == -1) ||
            (!myCheckoutEditVersion && version.versionTimestamp != -1)),
      );
      if (versionIndex === -1) {
        console.warn('not able to identify the nodeVersion', nodeVersion, 'in versions', history.versions);
        return 'not found version';
      }
      const versionObj = history.versions[versionIndex];

      if (isEditVersion) {
        if (versionIndex === firstEditVersion || myCheckoutEditVersion) return 'PREVIEW';
        else return `PREVIEW ${versionObj.major}.${versionObj.minor}`;
      } else {
        if (normalizedCurrentViewStatus === ViewStatus.LIVE && versionIndex === firstLiveVersion) return 'LIVE';
        else return `LIVE ${versionObj.major}.${versionObj.minor}`;
      }
    }

    if (!currentNode?.version) {
      return 'LIVE';
    }

    return normalizedCurrentViewStatus;
  };

  const getLatestViewVersion = (currentViewStatus: ViewStatus | string): NodeVersion => {
    const normalizedCurrentViewStatus = normalizeViewStatus(currentViewStatus);
    let version: NodeVersion | undefined;
    switch (normalizedCurrentViewStatus) {
      case ViewStatus.PREVIEW:
        version =
          history.versions?.find((version: NodeVersion) => !version.live && version.versionTimestamp !== -1) ||
          history.versions?.[0];
        break;
      case ViewStatus.LIVE:
        version =
          history.versions?.find((version: NodeVersion) => version.live && version.versionTimestamp !== -1) ||
          history.versions?.[0];
        break;
      default:
        console.warn('Unknown viewStatus', normalizedCurrentViewStatus, 'using first version', history.versions?.[0]);
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
    refetch,
  };
};

export default useVersions;
