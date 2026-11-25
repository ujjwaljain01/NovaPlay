import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { likedQueryKeys } from '@/features/liked/queries/liked.query-keys';
import { toggleVideoLike } from '../api/video.api';
import { videoQueryKeys } from '../queries/video.query-keys';
import type { EnrichedVideo } from '../types/video.schemas';

export function useVideoLike(videoId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => toggleVideoLike(videoId),

		onMutate: async () => {
			if (!videoId) {
				return { previousVideo: undefined };
			}

			await queryClient.cancelQueries({
				queryKey: videoQueryKeys.detail(videoId),
			});

			const previousVideo = queryClient.getQueryData<EnrichedVideo>(
				videoQueryKeys.detail(videoId),
			);

			if (previousVideo) {
				const nextLiked = !previousVideo.isLiked;
				queryClient.setQueryData<EnrichedVideo>(
					videoQueryKeys.detail(videoId),
					{
						...previousVideo,
						isLiked: nextLiked,
						likeCount: nextLiked
							? previousVideo.likeCount + 1
							: Math.max(0, previousVideo.likeCount - 1),
					},
				);
			}

			return { previousVideo };
		},

		onError: (err, _variables, context) => {
			if (context?.previousVideo && videoId) {
				queryClient.setQueryData(
					videoQueryKeys.detail(videoId),
					context.previousVideo,
				);
			}
			toast.error(err.message || 'Failed to update like status');
		},

		onSettled: () => {
			if (videoId) {
				queryClient.invalidateQueries({
					queryKey: videoQueryKeys.detail(videoId),
				});
			}
			queryClient.invalidateQueries({
				queryKey: likedQueryKeys.videos(),
			});
		},
	});
}
