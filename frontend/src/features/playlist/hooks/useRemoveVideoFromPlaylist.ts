import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { removeVideoFromPlaylist } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';
import type { PlaylistDetail } from '../types/playlist.schemas';

export interface RemovePlaylistVideoInput {
	videoId: string;
	playlistId: string;
}

export function useRemoveVideoFromPlaylist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ videoId, playlistId }: RemovePlaylistVideoInput) =>
			removeVideoFromPlaylist(videoId, playlistId),

		onMutate: async ({ videoId, playlistId }) => {
			await queryClient.cancelQueries({
				queryKey: playlistQueryKeys.detail(playlistId),
			});
			const previousDetail = queryClient.getQueryData<PlaylistDetail>(
				playlistQueryKeys.detail(playlistId),
			);

			if (previousDetail) {
				queryClient.setQueryData<PlaylistDetail>(
					playlistQueryKeys.detail(playlistId),
					{
						...previousDetail,
						videos: previousDetail.videos.filter((v) => v._id !== videoId),
					},
				);
			}

			return { previousDetail, playlistId };
		},

		onSuccess: () => {
			toast.success('Video removed from playlist');
		},

		onError: (err, _variables, context) => {
			if (context?.previousDetail) {
				queryClient.setQueryData(
					playlistQueryKeys.detail(context.playlistId),
					context.previousDetail,
				);
			}
			toast.error(err.message || 'Failed to remove video from playlist');
		},

		onSettled: (_data, _error, { playlistId }) => {
			queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: playlistQueryKeys.detail(playlistId),
			});
		},
	});
}
