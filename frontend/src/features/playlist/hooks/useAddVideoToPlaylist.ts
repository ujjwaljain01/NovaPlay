import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addVideoToPlaylist } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export interface PlaylistVideoInput {
	videoId: string;
	playlistId: string;
}

export function useAddVideoToPlaylist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ videoId, playlistId }: PlaylistVideoInput) =>
			addVideoToPlaylist(videoId, playlistId),
		onSuccess: () => {
			toast.success('Video added to playlist');
		},
		onError: (err) => {
			toast.error(err.message || 'Failed to add video to playlist');
		},
		onSettled: (_data, _error, { playlistId }) => {
			queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: playlistQueryKeys.detail(playlistId),
			});
		},
	});
}
