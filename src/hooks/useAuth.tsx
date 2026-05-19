import { useQuery } from '@tanstack/react-query';

const getUserFromBackend = async () => {
  console.log('calling getUserFromBackend');
  const response = await fetch('/api/users');
  console.log('getUserFromBackend response', response);
  if (!response.ok) {
    return undefined;
  }
  return await response.json();
};

const useAuth = () => {
  const { data: authData } = useQuery({
    queryKey: ['user'],
    queryFn: getUserFromBackend,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data: { user: authData } };
};

export default useAuth;
