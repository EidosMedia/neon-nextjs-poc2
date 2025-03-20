import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { authSlices, getAuthData } from '@/lib/features/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();

  const authData = useSelector(getAuthData);
  const getUserFromBackend = async () => {
    const authResp = await (await fetch('/api/users')).json();
    dispatch(authSlices.actions.setAuthData(authResp));
  };

  useEffect(() => {
    if (!authData.name) {
      getUserFromBackend();
    }
  }, []);

  console.log('authData', authData);

  return { data: authData };
};

export default useAuth;
