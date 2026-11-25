export const dashboardQueryKeys = {
	all: ['dashboard'] as const,

	stats: () => [...dashboardQueryKeys.all, 'stats'] as const,

	videos: () => [...dashboardQueryKeys.all, 'videos'] as const,

	videosPage: (page: number) =>
		[...dashboardQueryKeys.videos(), { page }] as const,
};
