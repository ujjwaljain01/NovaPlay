import { z } from 'zod';

export const WatchHistoryOwnerSchema = z.object({
	_id: z.string().optional(),
	fullName: z.string(),
	username: z.string(),
	avatar: z.string(),
});

export type WatchHistoryOwner = z.infer<typeof WatchHistoryOwnerSchema>;

export const WatchHistoryVideoSchema = z.object({
	_id: z.string(),
	title: z.string(),
	description: z.string().optional(),
	videoFile: z.string().optional(),
	thumbnail: z.string(),
	duration: z.number(),
	views: z.number().optional().default(0),
	createdAt: z.string(),
	owner: WatchHistoryOwnerSchema,
});

export type WatchHistoryVideo = z.infer<typeof WatchHistoryVideoSchema>;

export const WatchHistoryListSchema = z.array(WatchHistoryVideoSchema);

export type WatchHistoryList = z.infer<typeof WatchHistoryListSchema>;
