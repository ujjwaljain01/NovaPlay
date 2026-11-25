import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { addVideoToPlaylist, getWatchLaterPlaylist } from '../api/playlist.api';
import { playlistQueryKeys } from '../queries/playlist.query-keys';
import type { PlaylistDetail } from '../types/playlist.schemas';

export function useSaveToWatchLater() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (videoId: string) => {
			const cachedWatchLater = queryClient.getQueryData<PlaylistDetail>(
				playlistQueryKeys.watchLater(),
			);

			const watchLater =
				cachedWatchLater ??
				(await queryClient.fetchQuery<PlaylistDetail>({
					queryKey: playlistQueryKeys.watchLater(),
					queryFn: getWatchLaterPlaylist,
				}));

			return addVideoToPlaylist(videoId, watchLater._id);
		},
		onSuccess: () => {
			toast.success('Saved to Watch Later');
		},
		onError: (err: AxiosError<{ message?: string }>) => {
			if (err.response?.status === 409) {
				toast.info('Video is already in Watch Later');
				return;
			}
			toast.error(
				err.response?.data?.message ||
					err.message ||
					'Failed to save video to Watch Later',
			);
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: playlistQueryKeys.watchLater(),
			});
			void queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists() });
		},
	});
}
