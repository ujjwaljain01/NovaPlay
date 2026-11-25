import { useQuery } from '@tanstack/react-query';
import { getWatchLaterPlaylist } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export function useWatchLater(enabled = true) {
	return useQuery({
		queryKey: playlistQueryKeys.watchLater(),
		queryFn: getWatchLaterPlaylist,
		enabled,
		staleTime: 1000 * 60 * 5,
	});
}
