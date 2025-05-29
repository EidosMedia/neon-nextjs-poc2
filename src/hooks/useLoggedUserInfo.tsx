'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  getAnalytics,
  getInspectItems,
  getEdited,
  setInspectItems as setInspectItemsAction,
  setEdited as setEditedAction,
} from '@/lib/features/loggedUserSlice';
import { useEffect, useState } from 'react';
import { isNeonAppPreview } from '@eidosmedia/neon-frontoffice-ts-sdk';

const useLoggedUserInfo = () => {
  const dispatch = useDispatch();
  const inspectItems = useSelector(getInspectItems);
  const edited = useSelector(getEdited);
  const analyticsData = useSelector(getAnalytics);
  const [preview, setPreview] = useState(false);

  const setInspectItems = (value: boolean) => {
    dispatch(setInspectItemsAction(value));
  };

  const setEdited = (value: boolean) => {
    dispatch(setEditedAction(value));
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

  const changeEdited = (value: boolean) => {
    setEdited(value);
  };

  return {
    data: {
      inspectItems,
      edited,
      analytics: analyticsData,
      preview: preview,
    },
    changeInspectItems,
    changeEdited,
  };
};

export default useLoggedUserInfo;
