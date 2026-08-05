import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';
import useVersions from '@/hooks/useVersions';
import useAuthContext from '@/hooks/useAuthContext';
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';

const EditedChip: React.FC<LoggedUserBarComponentProps> = ({ data }) => {
  const { data: authContext } = useAuthContext();
  const viewStatus = normalizeViewStatus(data.siteData?.viewStatus);
  const canUseVersions = viewStatus === ViewStatus.PREVIEW || authContext.hasEditorialAuth;

  const { edited } = useVersions({
    currentNode: data.model.data as any,
    viewStatus: ViewStatus.PREVIEW,
    enabled: canUseVersions,
  });

  return edited ? (
    <div className="relative flex items-center justify-center text-orange-500 bg-orange-200 border-orange-500 rounded-full h-7 px-2 font-bold">
      EDITED
    </div>
  ) : null;
};

export default EditedChip;
