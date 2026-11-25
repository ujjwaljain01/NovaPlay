import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { channelQueryKeys } from '@/features/channel/queries/channel.query-keys';
import { historyQueryKeys } from '@/features/history/queries/history.query-keys';
import { playlistQueryKeys } from '@/features/playlist/queries/playlist.query-keys';
import { videoQueryKeys } from '@/features/videos/queries/video.query-keys';
import { deleteStudioVideo } from '../api/studio.api';
import { studioQueryKeys } from '../queries/studio.query-keys';
import type { StudioVideo } from '../types/studio.schemas';

export function useDeleteStudioVideo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (videoId: string) => deleteStudioVideo(videoId),
		onMutate: async (videoId) => {
			await queryClient.cancelQueries({ queryKey: studioQueryKeys.videos() });
			const previousVideos = queryClient.getQueryData<StudioVideo[]>(
				studioQueryKeys.videos(),
			);

			if (previousVideos) {
				queryClient.setQueryData<StudioVideo[]>(
					studioQueryKeys.videos(),
					previousVideos.filter((v) => v._id !== videoId),
				);
			}

			return { previousVideos };
		},
		onSuccess: () => {
			toast.success('Video deleted successfully');
		},
		onError: (err: Error, _videoId, context) => {
			if (context?.previousVideos) {
				queryClient.setQueryData(
					studioQueryKeys.videos(),
					context.previousVideos,
				);
			}
			toast.error(err.message || 'Failed to delete video');
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: studioQueryKeys.all });
			void queryClient.invalidateQueries({ queryKey: videoQueryKeys.all });
			void queryClient.invalidateQueries({ queryKey: playlistQueryKeys.all });
			void queryClient.invalidateQueries({ queryKey: historyQueryKeys.all });
			void queryClient.invalidateQueries({ queryKey: channelQueryKeys.all });
		},
	});
}
