import { useQuery } from '@tanstack/react-query';
import { getWatchHistory } from '../api/history.api';
import { historyQueryKeys } from '../queries/history.query-keys';

export function useWatchHistory() {
	return useQuery({
		queryKey: historyQueryKeys.list(),
		queryFn: getWatchHistory,
		staleTime: 1000 * 60 * 2,
	});
}
