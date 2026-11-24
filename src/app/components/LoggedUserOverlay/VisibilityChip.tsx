import { Info } from 'lucide-react';
import { LoggedUserBarComponentProps } from './LoggedUserOverlay.types';

const formatDate = (value: string | number) => {
  const date = new Date(value);
  return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const calculateExpireString = (pubInfo?: { startVisible?: string | number; endVisible?: string | number }): string => {
  if (pubInfo?.startVisible && pubInfo.endVisible) {
    return `This item will be visible from ${formatDate(pubInfo.startVisible)} and will expire on ${formatDate(pubInfo.endVisible)}`;
  }
  if (pubInfo?.startVisible) return `This item will be visible from ${formatDate(pubInfo.startVisible)}`;
  if (pubInfo?.endVisible) return `This item will expire on ${formatDate(pubInfo.endVisible)}`;
  return '';
};

const VisibilityChip: React.FC<LoggedUserBarComponentProps> = ({ data }) => {
  const expireString = calculateExpireString(data.model.data.pubInfo);

  return expireString ? (
    <span className="neon-admin__visibility">
      <Info size={14} aria-hidden="true" />
      {expireString}
    </span>
  ) : null;
};

export default VisibilityChip;
