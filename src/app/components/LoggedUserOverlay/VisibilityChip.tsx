import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';

const calculateExpireString = (pubInfo: any): string => {
  if (pubInfo.startVisible && pubInfo.endVisible) {
    const startDate = new Date(pubInfo.startVisible);
    const endDate = new Date(pubInfo.endVisible);
    return `VISIBLE BETWEEN ${startDate.toLocaleDateString()} - ${startDate.toLocaleTimeString()} AND ${endDate.toLocaleDateString()} - ${endDate.toLocaleTimeString()}`;
  }
  if (pubInfo.startVisible) {
    const startDate = new Date(pubInfo.startVisible);
    return `VISIBLE FROM ${startDate.toLocaleDateString()} - ${startDate.toLocaleTimeString()}`;
  }
  if (pubInfo.endVisible) {
    const endDate = new Date(pubInfo.endVisible);
    return `EXPIRES ON ${endDate.toLocaleDateString()} - ${endDate.toLocaleTimeString()}`;
  }

  return '';
};

const VisibilityChip: React.FC<LoggedUserBarComponentProps> = ({ data }) => {
  const expireString = calculateExpireString(data.model.data.pubInfo);

  return expireString ? (
    <div className="relative flex items-center justify-center text-orange-500 bg-orange-200 border-orange-500 rounded-full h-7 px-2 font-bold">
      {expireString}
    </div>
  ) : null;
};

export default VisibilityChip;
