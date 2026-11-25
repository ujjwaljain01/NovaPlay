export const subscriptionsQueryKeys = {
	all: ['subscriptions'] as const,

	lists: () => [...subscriptionsQueryKeys.all, 'list'] as const,

	list: (userId: string) =>
		[...subscriptionsQueryKeys.lists(), userId] as const,

	channels: () => [...subscriptionsQueryKeys.all, 'channels'] as const,

	feed: () => [...subscriptionsQueryKeys.all, 'feed'] as const,
};
