export const historyQueryKeys = {
	all: ['history'] as const,

	list: () => [...historyQueryKeys.all, 'list'] as const,
};
