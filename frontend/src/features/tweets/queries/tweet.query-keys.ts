export const tweetQueryKeys = {
	all: ['tweets'] as const,
	lists: () => [...tweetQueryKeys.all, 'list'] as const,
	list: (params?: any) => [...tweetQueryKeys.lists(), params] as const,
	details: () => [...tweetQueryKeys.all, 'detail'] as const,
	detail: (id: string) => [...tweetQueryKeys.details(), id] as const,
	byUser: (userId: string) => [...tweetQueryKeys.all, 'user', userId] as const,
};
