import { useSelector } from 'react-redux';
import { getAnalytics, getInspectItems } from '@/lib/features/loggedUserSlice';

const useLoggedUserInfo = () => {
  const inspectItemsData = useSelector(getInspectItems);
  const analyticsData = useSelector(getAnalytics);

  return {
    data: {
      inspectItems: inspectItemsData,
      analytics: analyticsData,
    },
  };
};

export default useLoggedUserInfo;
