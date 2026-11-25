import { useQuery } from '@tanstack/react-query';
import { getLikedVideos } from '../api/liked.api';
import { likedQueryKeys } from '../queries/liked.query-keys';

export function useLikedVideos() {
	return useQuery({
		queryKey: likedQueryKeys.videos(),
		queryFn: getLikedVideos,
		staleTime: 1000 * 60 * 5,
	});
}
