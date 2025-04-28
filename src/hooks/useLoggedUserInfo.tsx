import { useSelector } from 'react-redux';
import { getAnalytics, getInspectItems } from '@/lib/features/loggedUserSlice';

const useLoggedUserInfo = () => {
  const inspectItemsData = localStorage.getItem('inspectItems') === 'true';
  const analyticsData = useSelector(getAnalytics);

  const setInspectItems = (value: boolean) => {
    localStorage.setItem('inspectItems', JSON.stringify(value));
  };

  return {
    data: {
      inspectItems: inspectItemsData,
      analytics: analyticsData,
    },
    setInspectItems,
  };
};

export default useLoggedUserInfo;
