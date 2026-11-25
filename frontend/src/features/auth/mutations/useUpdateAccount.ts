import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateAccount, type UpdateAccountPayload } from '../auth.api';
import { authQueryKeys } from '../auth.query-keys';
import { useAuthStore } from '../auth.store';

export function useUpdateAccount() {
	const queryClient = useQueryClient();
	const setUser = useAuthStore((s) => s.setUser);

	return useMutation({
		mutationFn: (payload: UpdateAccountPayload) => updateAccount(payload),
		onSuccess: (updatedUser) => {
			setUser(updatedUser);
			toast.success('Account details updated');
		},
		onError: (err) => {
			toast.error(err.message || 'Failed to update account');
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: authQueryKeys.currentUser(),
			});
		},
	});
}
