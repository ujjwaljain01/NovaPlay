import { useQuery } from '@tanstack/react-query';
import { getUserTweets } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';
import type { Tweet } from '../types/tweet.types';

export function useUserTweets(userId: string, enabled = true) {
	return useQuery({
		queryKey: tweetQueryKeys.byUser(userId),
		queryFn: async (): Promise<Tweet[]> => {
			const data = await getUserTweets(userId);
			if (Array.isArray(data)) {
				return data;
			}
			const wrapped = data as unknown as { tweets?: Tweet[] };
			return wrapped?.tweets ?? [];
		},
		enabled: !!userId && enabled,
		staleTime: 1000 * 60 * 2,
	});
}
