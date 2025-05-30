'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  getAnalytics,
  getInspectItems,
  setInspectItems as setInspectItemsAction,
} from '@/lib/features/loggedUserSlice';
import { useEffect, useState } from 'react';
import { isNeonAppPreview } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useLoggedUserInfo = () => {
  const dispatch = useDispatch();
  const inspectItems = useSelector(getInspectItems);
  const analyticsData = useSelector(getAnalytics);
  const [preview, setPreview] = useState(false);

  const setInspectItems = (value: boolean) => {
    dispatch(setInspectItemsAction(value));
  };

  useEffect(() => {
    const initialItemsData = localStorage.getItem('inspectItems') === 'true';
    setInspectItems(initialItemsData);
    setPreview(isNeonAppPreview());

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

  console.log('preview', preview);

  return {
    data: {
      inspectItems,
      analytics: analyticsData,
      preview: preview,
    },
    changeInspectItems,
  };
};

export default useLoggedUserInfo;
