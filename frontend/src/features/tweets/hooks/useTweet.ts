import { useQuery } from '@tanstack/react-query';
import { getTweetById } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';

export function useTweet(tweetId: string) {
	return useQuery({
		queryKey: tweetQueryKeys.detail(tweetId),
		queryFn: () => getTweetById(tweetId),
		enabled: !!tweetId,
		staleTime: 1000 * 60 * 2,
	});
}
