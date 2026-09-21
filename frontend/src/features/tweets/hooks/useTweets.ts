import { useQuery } from '@tanstack/react-query';
import { getTweets, type GetTweetsParams } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';

export function useTweets(params: GetTweetsParams = {}) {
	return useQuery({
		queryKey: tweetQueryKeys.list(params),
		queryFn: () => getTweets(params),
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60 * 3,
	});
}
