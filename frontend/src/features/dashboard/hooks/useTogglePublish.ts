import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toggleVideoPublish } from '@/features/videos/api/video.api';
import { dashboardQueryKeys } from '../queries/dashboard.query-keys';
import type { DashboardVideosResponse } from '../types/dashboard.schemas';

export function useTogglePublish() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (videoId: string) => toggleVideoPublish(videoId),

		onMutate: async (videoId) => {
			await queryClient.cancelQueries({
				queryKey: dashboardQueryKeys.videos(),
			});
			const previousQueries =
				queryClient.getQueriesData<DashboardVideosResponse>({
					queryKey: dashboardQueryKeys.videos(),
				});

			queryClient.setQueriesData<DashboardVideosResponse>(
				{ queryKey: dashboardQueryKeys.videos() },
				(old) => {
					if (!old) return old;
					return {
						...old,
						docs: old.docs.map((video) =>
							video._id === videoId
								? { ...video, isPublished: !video.isPublished }
								: video,
						),
					};
				},
			);

			return { previousQueries };
		},

		onError: (err, _videoId, context) => {
			if (context?.previousQueries) {
				for (const [key, data] of context.previousQueries) {
					queryClient.setQueryData(key, data);
				}
			}
			toast.error(err.message || 'Failed to toggle publish status');
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
		},
	});
}
