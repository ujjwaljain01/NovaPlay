import { z } from 'zod';

export const EXPLORE_CATEGORIES = [
	'trending',
	'gaming',
	'sports',
	'music',
	'news',
] as const;

export const ExploreCategorySchema = z.enum(EXPLORE_CATEGORIES);
export type ExploreCategory = z.infer<typeof ExploreCategorySchema>;

export const ExploreContentTypeSchema = z.enum(['all', 'videos', 'tweets']);
export type ExploreContentType = z.infer<typeof ExploreContentTypeSchema>;

const ExploreOwnerSchema = z
	.object({
		_id: z.string(),
		username: z.string(),
		fullName: z.string(),
		avatar: z
			.string()
			.nullish()
			.transform((value) => value ?? ''),
	})
	.nullish()
	.transform(
		(val) =>
			val ?? {
				_id: '',
				username: 'user',
				fullName: 'Nova User',
				avatar: '',
			},
	);

export const ExploreVideoItemSchema = z.object({
	_id: z.string(),
	feedType: z.literal('video'),
	createdAt: z.string(),
	owner: ExploreOwnerSchema,
	title: z.string(),
	thumbnail: z.string(),
	duration: z.number(),
	views: z.number().optional().default(0),
	hashtags: z.array(z.string()).optional().default([]),
});

export type ExploreVideoItem = z.infer<typeof ExploreVideoItemSchema>;

export const ExploreTweetItemSchema = z.object({
	_id: z.string(),
	feedType: z.literal('tweet'),
	createdAt: z.string(),
	owner: ExploreOwnerSchema,
	content: z.string(),
	views: z.number().optional().default(0),
	hashtags: z.array(z.string()).optional().default([]),
	likesCount: z.number().optional().default(0),
	commentsCount: z.number().optional().default(0),
	isLiked: z.boolean().optional().default(false),
});

export type ExploreTweetItem = z.infer<typeof ExploreTweetItemSchema>;

export const ExploreFeedItemSchema = z.discriminatedUnion('feedType', [
	ExploreVideoItemSchema,
	ExploreTweetItemSchema,
]);

export type ExploreFeedItem = z.infer<typeof ExploreFeedItemSchema>;

export const ExploreFeedResponseSchema = z.object({
	category: ExploreCategorySchema,
	type: ExploreContentTypeSchema,
	items: z.array(ExploreFeedItemSchema),
	page: z.number(),
	limit: z.number(),
	totalResults: z.number(),
	hasNextPage: z.boolean(),
});

export type ExploreFeedResponse = z.infer<typeof ExploreFeedResponseSchema>;
