export const searchQueryKeys = {
	all: ['search'] as const,

	results: <T extends Record<string, unknown>>(params: T) =>
		[...searchQueryKeys.all, 'results', params] as const,
};
