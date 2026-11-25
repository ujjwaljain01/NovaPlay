//src/features/auth/useCurrentUser.ts
import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from './auth.api';
import { authQueryKeys } from './auth.query-keys';

export const useCurrentUser = () =>
	useQuery({
		queryKey: authQueryKeys.currentUser(),
		
		queryFn: getCurrentUser,

		retry: false,

		staleTime: 1000 * 60 * 5,

		refetchOnWindowFocus: true,
	});
