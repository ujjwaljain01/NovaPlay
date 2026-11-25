import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deletePlaylist } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export function useDeletePlaylist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (playlistId: string) => deletePlaylist(playlistId),
		onSuccess: () => {
			toast.success('Playlist deleted');
		},
		onError: (err) => {
			toast.error(err.message || 'Failed to delete playlist');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists() });
		},
	});
}
