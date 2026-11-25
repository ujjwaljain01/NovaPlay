export const commentQueryKeys = {
	all: ['comments'] as const,
	byTarget: (targetId: string) => [...commentQueryKeys.all, targetId] as const,
	replies: (commentId: string) =>
		[...commentQueryKeys.all, 'replies', commentId] as const,
};
