import { useQuery } from '@tanstack/react-query';

type AuthContextResponse = {
  hasEditorialAuth: boolean;
  hasWebAuth: boolean;
};

const fetchAuthContext = async (): Promise<AuthContextResponse> => {
  const response = await fetch('/api/auth/context', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to fetch auth context: ${response.status}`);
  }
  return await response.json();
};

const useAuthContext = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth-context'],
    queryFn: fetchAuthContext,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  return {
    data: {
      hasEditorialAuth: !!data?.hasEditorialAuth,
      hasWebAuth: !!data?.hasWebAuth,
    },
    isLoading,
    isError,
  };
};

export default useAuthContext;
