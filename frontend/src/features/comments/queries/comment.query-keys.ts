export const commentQueryKeys = {
	all: ['comments'] as const,
	byTarget: (targetId: string) => [...commentQueryKeys.all, targetId] as const,
};
