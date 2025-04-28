'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  getAnalytics,
  getInspectItems,
  setInspectItems as setInspectItemsAction,
} from '@/lib/features/loggedUserSlice';
import { useEffect, useState } from 'react';

const useLoggedUserInfo = () => {
  const dispatch = useDispatch();
  const inspectItems = useSelector(getInspectItems);

  const analyticsData = useSelector(getAnalytics);

  const setInspectItems = (value: boolean) => {
    dispatch(setInspectItemsAction(value));
  };

  useEffect(() => {
    const initialItemsData = localStorage.getItem('inspectItems') === 'true';
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
    setInspectItems(value);
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
