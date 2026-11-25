// src/features/auth/mutations/useLogout.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logoutUser } from '../auth.api';
import { authQueryKeys } from '../auth.query-keys';
import { useAuthStore } from '../auth.store';

export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logoutUser,

		onSuccess: () => {
			useAuthStore.getState().logout();
			queryClient.removeQueries({ queryKey: authQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: ['videos'] });
			queryClient.invalidateQueries({ queryKey: ['tweets'] });
		},
	});
}
