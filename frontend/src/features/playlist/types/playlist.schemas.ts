import { z } from 'zod';

export const PlaylistVideoStubOwnerSchema = z.object({
	_id: z.string(),
	fullName: z.string(),
});

export const PlaylistVideoStubSchema = z.object({
	_id: z.string(),
	title: z.string(),
	thumbnail: z.string(),
	duration: z.number(),
	owner: PlaylistVideoStubOwnerSchema.optional(),
});

export type PlaylistVideoStub = z.infer<typeof PlaylistVideoStubSchema>;

export const PlaylistSchema = z.object({
	_id: z.string(),
	name: z.string(),
	description: z.string(),
	owner: z.string().optional(),
	isSystem: z.boolean().optional().default(false),
	systemType: z.enum(['watch_later']).nullable().optional(),
	totalVideos: z.number().optional().default(0),
	firstVideoThumbnail: z.string().nullable().optional(),
	videos: z.array(z.string()).optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type Playlist = z.infer<typeof PlaylistSchema>;

export const PlaylistListSchema = z.array(PlaylistSchema);

export const PlaylistDetailOwnerSchema = z.object({
	_id: z.string(),
	avatar: z.string().optional(),
	fullName: z.string(),
});

export const PlaylistDetailSchema = z.object({
	_id: z.string(),
	name: z.string(),
	description: z.string(),
	isSystem: z.boolean().optional().default(false),
	systemType: z.enum(['watch_later']).nullable().optional(),
	videos: z.array(PlaylistVideoStubSchema),
	owner: PlaylistDetailOwnerSchema.optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type PlaylistDetail = z.infer<typeof PlaylistDetailSchema>;
