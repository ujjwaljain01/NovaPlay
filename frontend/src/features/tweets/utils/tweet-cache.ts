import type { QueryClient } from '@tanstack/react-query';
import { tweetQueryKeys } from '../queries/tweet.query-keys';
import type { GetTweetsResponse, Tweet } from '../types/tweet.types';

function patchTweetCount(tweet: Tweet, tweetId: string, delta: number): Tweet {
	if (tweet._id !== tweetId) return tweet;
	const current = tweet.commentsCount ?? 0;
	return {
		...tweet,
		commentsCount: Math.max(0, current + delta),
	};
}

export function adjustTweetCommentsCount(
	queryClient: QueryClient,
	tweetId: string,
	delta: number,
) {
	if (!tweetId || delta === 0) return;

	queryClient.setQueryData<Tweet>(tweetQueryKeys.detail(tweetId), (old) => {
		if (!old) return old;
		return patchTweetCount(old, tweetId, delta);
	});

	queryClient.setQueriesData<GetTweetsResponse>(
		{ queryKey: tweetQueryKeys.lists() },
		(old) => {
			if (!old?.docs) return old;
			return {
				...old,
				docs: old.docs.map((tweet) => patchTweetCount(tweet, tweetId, delta)),
			};
		},
	);

	queryClient.setQueriesData<Tweet[] | { tweets?: Tweet[] }>(
		{ queryKey: [...tweetQueryKeys.all, 'user'] },
		(old) => {
			if (!old) return old;
			if (Array.isArray(old)) {
				return old.map((tweet) => patchTweetCount(tweet, tweetId, delta));
			}
			if (Array.isArray(old.tweets)) {
				return {
					...old,
					tweets: old.tweets.map((tweet) =>
						patchTweetCount(tweet, tweetId, delta),
					),
				};
			}
			return old;
		},
	);
}

export function invalidateTweetCommentCounts(
	queryClient: QueryClient,
	tweetId: string,
) {
	if (!tweetId) return;
	queryClient.invalidateQueries({ queryKey: tweetQueryKeys.detail(tweetId) });
	queryClient.invalidateQueries({ queryKey: tweetQueryKeys.lists() });
	queryClient.invalidateQueries({
		queryKey: [...tweetQueryKeys.all, 'user'],
	});
}
