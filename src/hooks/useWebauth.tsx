'use client';
import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { getUserName, setUserName as setUserNameAction } from '@/lib/features/webauthSlice';

const useWebauth = () => {
  const dispatch = useDispatch();
  const userName = useSelector(getUserName);

  useEffect(() => {
    const name = localStorage.getItem('webauthName');
    setUserName(name || '');
  }, []);

  const setUserName = (data: string) => {
    dispatch(setUserNameAction(data));
    localStorage.setItem('webauthName', data);
  };

  return { data: { userName }, setUserName };
};

export default useWebauth;
