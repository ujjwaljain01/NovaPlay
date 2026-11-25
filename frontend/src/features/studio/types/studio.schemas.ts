import { z } from 'zod';

export const StudioStatsSchema = z.object({
	videos: z.number(),
	totalViews: z.number(),
	subscriberCount: z.number(),
	totalComments: z.number(),
	totalLikes: z.number(),
});

export type StudioStats = z.infer<typeof StudioStatsSchema>;

export const StudioVideoSchema = z.object({
	_id: z.string(),
	title: z.string(),
	description: z.string().default(''),
	thumbnail: z.string(),
	thumbnailPublicId: z.string().optional(),
	videoFile: z.string().optional(),
	duration: z.number().default(0),
	views: z.number().default(0),
	isPublished: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	likeCount: z.number().default(0),
	commentCount: z.number().default(0),
});

export type StudioVideo = z.infer<typeof StudioVideoSchema>;

export const StudioVideoListSchema = z.array(StudioVideoSchema);
