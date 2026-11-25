import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toggleSubscription } from '../api/subscriptions.api';
import { subscriptionsQueryKeys } from '../queries/subscriptions.query-keys';
import { channelQueryKeys } from '@/features/channel/queries/channel.query-keys';
import { videoQueryKeys } from '@/features/videos/queries/video.query-keys';
import type { ChannelProfile } from '@/features/channel/types/channel.schemas';
import type { EnrichedVideo } from '@/features/videos/types/video.schemas';

export interface ToggleSubscriptionInput {
	channelId: string;
	username?: string;
	videoId?: string;
}

export function useToggleSubscription() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ channelId }: ToggleSubscriptionInput) =>
			toggleSubscription(channelId),

		onMutate: async ({ username, videoId }) => {
			let previousProfile: ChannelProfile | undefined;
			let previousVideo: EnrichedVideo | undefined;

			if (username) {
				await queryClient.cancelQueries({
					queryKey: channelQueryKeys.profile(username),
				});
				previousProfile = queryClient.getQueryData<ChannelProfile>(
					channelQueryKeys.profile(username),
				);
				if (previousProfile) {
					const nextSubscribed = !previousProfile.isSubscribed;
					queryClient.setQueryData<ChannelProfile>(
						channelQueryKeys.profile(username),
						{
							...previousProfile,
							isSubscribed: nextSubscribed,
							subscribersCount: nextSubscribed
								? previousProfile.subscribersCount + 1
								: Math.max(0, previousProfile.subscribersCount - 1),
						},
					);
				}
			}

			if (videoId) {
				await queryClient.cancelQueries({
					queryKey: videoQueryKeys.detail(videoId),
				});
				previousVideo = queryClient.getQueryData<EnrichedVideo>(
					videoQueryKeys.detail(videoId),
				);
				if (previousVideo) {
					const nextSubscribed = !previousVideo.isSubscribed;
					queryClient.setQueryData<EnrichedVideo>(
						videoQueryKeys.detail(videoId),
						{
							...previousVideo,
							isSubscribed: nextSubscribed,
							owner: {
								...previousVideo.owner,
								subscribersCount: nextSubscribed
									? previousVideo.owner.subscribersCount + 1
									: Math.max(0, previousVideo.owner.subscribersCount - 1),
							},
						},
					);
				}
			}

			return { previousProfile, previousVideo, username, videoId };
		},

		onError: (err, _variables, context) => {
			if (context?.username && context.previousProfile) {
				queryClient.setQueryData(
					channelQueryKeys.profile(context.username),
					context.previousProfile,
				);
			}
			if (context?.videoId && context.previousVideo) {
				queryClient.setQueryData(
					videoQueryKeys.detail(context.videoId),
					context.previousVideo,
				);
			}
			toast.error(err.message || 'Failed to update subscription');
		},

		onSettled: (_data, _error, { username, videoId }) => {
			queryClient.invalidateQueries({
				queryKey: subscriptionsQueryKeys.all,
			});
			if (username) {
				queryClient.invalidateQueries({
					queryKey: channelQueryKeys.profile(username),
				});
			}
			if (videoId) {
				queryClient.invalidateQueries({
					queryKey: videoQueryKeys.detail(videoId),
				});
			}
		},
	});
}
