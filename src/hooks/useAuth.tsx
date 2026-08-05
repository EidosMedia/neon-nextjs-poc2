import { useQuery } from '@tanstack/react-query';

type UseAuthOptions = {
  enabled?: boolean;
};

const getUserFromBackend = async () => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  return await response.json();
};

const useAuth = ({ enabled = true }: UseAuthOptions = {}) => {
  const { data: authData } = useQuery({
    queryKey: ['user'],
    queryFn: getUserFromBackend,
    enabled,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data: { user: authData } };
};

export default useAuth;
