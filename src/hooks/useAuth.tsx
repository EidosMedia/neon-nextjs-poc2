import { useQuery } from '@tanstack/react-query';

const useAuth = () => {
  const getUserFromBackend = async () => {
    return await (await fetch('/api/users')).json();
  };

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
