import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	updatePlaylist,
	type UpdatePlaylistPayload,
} from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';

export interface UpdatePlaylistInput {
	playlistId: string;
	payload: UpdatePlaylistPayload;
}

export function useUpdatePlaylist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ playlistId, payload }: UpdatePlaylistInput) =>
			updatePlaylist(playlistId, payload),
		onSuccess: () => {
			toast.success('Playlist updated');
		},
		onError: (err) => {
			toast.error(err.message || 'Failed to update playlist');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: playlistQueryKeys.all });
		},
	});
}
