import { useQuery } from '@tanstack/react-query';

const getUserFromBackend = async () => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
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
