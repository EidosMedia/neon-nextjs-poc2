'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  getAnalytics,
  getInspectItems,
  setInspectItems as setInspectItemsAction,
  getViewStatus,
  setViewStatus as setViewStatusAction,
  getInspectItemsVisible,
} from '@/lib/features/loggedUserSlice';
import { useState } from 'react';

const useLoggedUserInfo = () => {
  const dispatch = useDispatch();
  const inspectItems = useSelector(getInspectItems);
  const inspectItemsVisible = useSelector(getInspectItemsVisible);
  const analyticsData = useSelector(getAnalytics);
  const viewStatus = useSelector(getViewStatus);
  const [preview, setPreview] = useState(false);

  const setInspectItems = (value: boolean) => {
    dispatch(setInspectItemsAction(value));
  };

  const setViewStatus = (value: string) => {
    dispatch(setViewStatusAction(value));
  };

  const changeInspectItems = (value: boolean) => {
    setInspectItems(value);
  };

  return {
    data: {
      inspectItemsVisible,
      inspectItems,
      analytics: analyticsData,
      preview: preview,
      viewStatus: viewStatus,
    },
    changeInspectItems,
    setViewStatus,
  };
};

export default useLoggedUserInfo;
