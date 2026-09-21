import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTweet } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';
import { toast } from 'sonner';

export function useCreateTweet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => createTweet(content),
		onSuccess: () => {
			toast.success('Tweet posted successfully!');
			queryClient.invalidateQueries({ queryKey: tweetQueryKeys.all });
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || err.message || 'Failed to post tweet');
		},
	});
}
