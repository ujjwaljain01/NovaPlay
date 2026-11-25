import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	createPlaylist,
	type CreatePlaylistPayload,
} from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export function useCreatePlaylist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePlaylistPayload) => createPlaylist(payload),
		onSuccess: () => {
			toast.success('Playlist created');
		},
		onError: (err) => {
			toast.error(err.message || 'Failed to create playlist');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists() });
		},
	});
}
