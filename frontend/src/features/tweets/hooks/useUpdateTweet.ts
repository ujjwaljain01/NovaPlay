import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateTweet } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';

export interface UpdateTweetInput {
	tweetId: string;
	content: string;
}

export function useUpdateTweet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ tweetId, content }: UpdateTweetInput) =>
			updateTweet(tweetId, content),
		onSuccess: () => {
			toast.success('Tweet updated');
			void queryClient.invalidateQueries({ queryKey: tweetQueryKeys.all });
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to update tweet');
		},
	});
}
