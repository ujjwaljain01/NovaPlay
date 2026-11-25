import { useQuery } from '@tanstack/react-query';
import { getUserPlaylists } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export function usePlaylists(userId: string) {
	return useQuery({
		queryKey: playlistQueryKeys.list(userId),
		queryFn: () => getUserPlaylists(userId),
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	});
}
