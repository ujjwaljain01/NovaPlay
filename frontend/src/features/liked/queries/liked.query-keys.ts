export const likedQueryKeys = {
	all: ['liked'] as const,

	videos: () => [...likedQueryKeys.all, 'videos'] as const,
};
