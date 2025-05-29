import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';

const EditedChip: React.FC = () => {
  const { data: loggedUserInfo } = useLoggedUserInfo();

  return loggedUserInfo.edited ? (
    <div className="relative flex items-center justify-center text-orange-500 bg-orange-200 border-orange-500 rounded-full h-7 px-2 font-bold">
      EDITED
    </div>
  ) : null;
};

export default EditedChip;
