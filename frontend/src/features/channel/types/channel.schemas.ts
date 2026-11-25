import { z } from 'zod';

export const ChannelProfileSchema = z.object({
	_id: z.string(),
	fullName: z.string(),
	username: z.string(),
	email: z.string().optional(),
	avatar: z.string(),
	coverImage: z.string().nullable().optional(),
	subscribersCount: z.number().optional().default(0),
	ChannelsSubscriberToCount: z.number().optional().default(0),
	isSubscribed: z.boolean().optional().default(false),
	createdAt: z.string(),
});

export type ChannelProfile = z.infer<typeof ChannelProfileSchema>;

export const ChannelVideoOwnerSchema = z.object({
	_id: z.string(),
	username: z.string(),
	fullName: z.string(),
	avatar: z.string(),
});

export type ChannelVideoOwner = z.infer<typeof ChannelVideoOwnerSchema>;

export const ChannelVideoSchema = z.object({
	_id: z.string(),
	title: z.string(),
	description: z.string(),
	videoFile: z.string(),
	videoPublicId: z.string().optional(),
	thumbnail: z.string(),
	thumbnailPublicId: z.string().optional(),
	duration: z.number(),
	views: z.number().optional().default(0),
	isPublished: z.boolean().optional().default(true),
	likeCount: z.number().optional().default(0),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	owner: ChannelVideoOwnerSchema,
});

export type ChannelVideo = z.infer<typeof ChannelVideoSchema>;

export const ChannelVideosResponseSchema = z.object({
	docs: z.array(ChannelVideoSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

export type ChannelVideosResponse = z.infer<typeof ChannelVideosResponseSchema>;
