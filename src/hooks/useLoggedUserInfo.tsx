'use client';

import { useSelector } from 'react-redux';
import { getAnalytics } from '@/lib/features/loggedUserSlice';
import { useEffect, useState } from 'react';

const useLoggedUserInfo = () => {
  const [inspectItems, setInspectItems] = useState(false);
  const analyticsData = useSelector(getAnalytics);

  useEffect(() => {
    const initialItemsData = window && window.localStorage && window.localStorage.getItem('inspectItems') === 'true';
    setInspectItems(initialItemsData);
    const onChangeStorage = (event: StorageEvent) => {
      if (event.key === 'inspectItems') {
        const newValue = event.newValue === 'true';
        setInspectItems(newValue);
      }
    };

    window.addEventListener('storage', onChangeStorage);

    return () => {
      window.removeEventListener('storage', onChangeStorage);
    };
  }, []);

  const changeInspectItems = (value: boolean) => {
    localStorage.setItem('inspectItems', JSON.stringify(value));
  };

  return {
    data: {
      inspectItems,
      analytics: analyticsData,
    },
    changeInspectItems,
  };
};

export default useLoggedUserInfo;
