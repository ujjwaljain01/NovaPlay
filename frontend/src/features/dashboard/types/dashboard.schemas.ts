import { z } from 'zod';

export const DashboardStatsSchema = z.object({
	videos: z.number(),
	totalViews: z.number(),
	subscriberCount: z.number(),
	totalComments: z.number(),
	totalLikes: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const DashboardVideoSchema = z.object({
	_id: z.string(),
	title: z.string(),
	thumbnail: z.string(),
	views: z.number(),
	isPublished: z.boolean(),
	duration: z.number(),
	createdAt: z.string(),
	commentCount: z.number(),
	likeCount: z.number(),
});

export type DashboardVideo = z.infer<typeof DashboardVideoSchema>;

export const DashboardVideosResponseSchema = z.object({
	docs: z.array(DashboardVideoSchema),
	totalDocs: z.number(),
	limit: z.number(),
	page: z.number(),
	totalPages: z.number(),
	hasNextPage: z.boolean(),
	hasPrevPage: z.boolean().optional(),
	nextPage: z.number().nullable().optional(),
	prevPage: z.number().nullable().optional(),
});

export type DashboardVideosResponse = z.infer<
	typeof DashboardVideosResponseSchema
>;
