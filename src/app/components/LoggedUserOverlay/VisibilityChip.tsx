import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';

const VisibilityChip: React.FC<LoggedUserBarComponentProps> = ({ data }) => {
  const expirationDateString = data.model.changeVisibility;
  if (!expirationDateString) {
    return null;
  }

  const expirationDate = new Date(expirationDateString);

  return (
    <div className="relative flex items-center justify-center text-orange-500 bg-orange-200 border-orange-500 rounded-full h-7 px-2 font-bold">
      THIS ITEM WILL EXPIRE ON {expirationDate.toLocaleDateString()} - {expirationDate.toLocaleTimeString()}
    </div>
  );
};

export default VisibilityChip;
