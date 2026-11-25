import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addToWatchHistory } from '../api/history.api';
import { historyQueryKeys } from '../queries/history.query-keys';

export function useWriteHistory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (videoId: string) => addToWatchHistory(videoId),
		onError: (err) => {
			toast.error(err.message || 'Failed to update watch history');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: historyQueryKeys.list() });
		},
	});
}
