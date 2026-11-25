export const studioQueryKeys = {
	all: ['studio'] as const,

	stats: () => [...studioQueryKeys.all, 'stats'] as const,

	videos: () => [...studioQueryKeys.all, 'videos'] as const,
};
