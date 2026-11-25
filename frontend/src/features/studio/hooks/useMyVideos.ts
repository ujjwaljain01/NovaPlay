import { useQuery } from '@tanstack/react-query';
import { getMyVideos } from '../api/studio.api';
import { studioQueryKeys } from '../queries/studio.query-keys';

export function useMyVideos() {
	return useQuery({
		queryKey: studioQueryKeys.videos(),
		queryFn: getMyVideos,
		staleTime: 1000 * 60 * 2,
	});
}
