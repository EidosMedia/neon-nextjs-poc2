import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';
import useVersions from '@/hooks/useVersions';

const EditedChip: React.FC<LoggedUserBarComponentProps> = ({ data }) => {
  const { edited } = useVersions({ currentNode: data.model.data as any, viewStatus: 'PREVIEW' });
  return edited ? (
    <div className="relative flex items-center justify-center text-orange-500 bg-orange-200 border-orange-500 rounded-full h-7 px-2 font-bold">
      EDITED
    </div>
  ) : null;
};

export default EditedChip;
