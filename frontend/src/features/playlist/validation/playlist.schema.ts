import { z } from 'zod';

export const playlistFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Playlist name is required.')
		.max(100, 'Playlist name must be 100 characters or less.'),
	description: z
		.string()
		.trim()
		.min(1, 'Description is required.')
		.max(500, 'Description must be 500 characters or less.'),
});

export type PlaylistFormValues = z.infer<typeof playlistFormSchema>;
