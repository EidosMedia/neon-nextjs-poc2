import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';

const calculateExpireString = (pubInfo: any): string => {
  // const expirationDate = new Date(expirationDateString);

  if (pubInfo.startVisible && pubInfo.endVisible) {
    const startDate = new Date(pubInfo.startVisible);
    const endDate = new Date(pubInfo.endVisible);
    return `THIS ITEM WILL BETWEEN ${startDate.toLocaleDateString()} - ${startDate.toLocaleTimeString()} AND ${endDate.toLocaleTimeString()} - ${endDate.toLocaleDateString()}`;
  }
  if (pubInfo.startVisible) {
    const startDate = new Date(pubInfo.startVisible);
    return `THIS ITEM WILL APPEAR ON ${startDate.toLocaleDateString()} - ${startDate.toLocaleTimeString()}`;
  }
  if (pubInfo.endVisible) {
    const endDate = new Date(pubInfo.endVisible);
    return `THIS ITEM WILL DISAPPEAR ON ${endDate.toLocaleDateString()} - ${endDate.toLocaleTimeString()}`;
  }

  return '';
};

const VisibilityChip: React.FC<LoggedUserBarComponentProps> = ({ data }) => {
  const expireString = calculateExpireString(data.model.data.pubInfo);

  return expireString ? (
    <div className="relative flex items-center justify-center text-orange-500 bg-orange-200 border-orange-500 rounded-full h-7 px-2 font-bold">
      {/* THIS ITEM WILL EXPIRE ON {expirationDate.toLocaleDateString()} - {expirationDate.toLocaleTimeString()} */}
      {expireString}
    </div>
  ) : null;
};

export default VisibilityChip;
