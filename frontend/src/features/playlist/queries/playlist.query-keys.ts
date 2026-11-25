export const playlistQueryKeys = {
	all: ['playlists'] as const,

	lists: () => [...playlistQueryKeys.all, 'list'] as const,

	list: (userId: string) => [...playlistQueryKeys.lists(), userId] as const,

	details: () => [...playlistQueryKeys.all, 'detail'] as const,

	detail: (playlistId: string) =>
		[...playlistQueryKeys.details(), playlistId] as const,
};
