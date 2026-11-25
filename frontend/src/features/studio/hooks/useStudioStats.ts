import { useQuery } from '@tanstack/react-query';
import { getStudioStats } from '../api/studio.api';
import { studioQueryKeys } from '../queries/studio.query-keys';

export function useStudioStats() {
	return useQuery({
		queryKey: studioQueryKeys.stats(),
		queryFn: getStudioStats,
		staleTime: 1000 * 60 * 2,
	});
}
