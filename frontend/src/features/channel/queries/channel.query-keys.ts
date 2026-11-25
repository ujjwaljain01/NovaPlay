export const channelQueryKeys = {
	all: ['channel'] as const,

	profiles: () => [...channelQueryKeys.all, 'profile'] as const,

	profile: (username: string) =>
		[...channelQueryKeys.profiles(), username] as const,

	videos: (username: string) =>
		[...channelQueryKeys.all, username, 'videos'] as const,

	videosList: <T extends Record<string, unknown>>(username: string, params?: T) =>
		[...channelQueryKeys.videos(username), params] as const,
};
