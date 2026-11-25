export const subscriptionsQueryKeys = {
	all: ['subscriptions'] as const,

	lists: () => [...subscriptionsQueryKeys.all, 'list'] as const,

	list: (userId: string) =>
		[...subscriptionsQueryKeys.lists(), userId] as const,
};
