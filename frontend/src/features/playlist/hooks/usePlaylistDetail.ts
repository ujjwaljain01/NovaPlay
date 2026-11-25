import { useQuery } from '@tanstack/react-query';
import { getPlaylistById } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export function usePlaylistDetail(playlistId: string) {
	return useQuery({
		queryKey: playlistQueryKeys.detail(playlistId),
		queryFn: () => getPlaylistById(playlistId),
		enabled: !!playlistId,
		staleTime: 1000 * 60 * 5,
	});
}
