import { z } from 'zod';

export const SearchOwnerSchema = z.object({
	_id: z.string(),
	username: z.string(),
	fullName: z.string(),
	avatar: z.string(),
});

export type SearchOwner = z.infer<typeof SearchOwnerSchema>;

export const SearchVideoResultSchema = z.object({
	contentType: z.literal('video'),
	_id: z.string(),
	title: z.string(),
	description: z.string(),
	videoFile: z.string(),
	thumbnail: z.string(),
	duration: z.number(),
	views: z.number().optional().default(0),
	isPublished: z.boolean().optional().default(true),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	owner: SearchOwnerSchema,
});

export const SearchTweetResultSchema = z.object({
	contentType: z.literal('tweet'),
	_id: z.string(),
	content: z.string(),
	views: z.number().optional().default(0),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	owner: SearchOwnerSchema,
});

export const SearchChannelResultSchema = z.object({
	contentType: z.literal('channel'),
	_id: z.string(),
	username: z.string(),
	fullName: z.string(),
	avatar: z.string(),
	createdAt: z.string(),
});

export const SearchPlaylistResultSchema = z.object({
	contentType: z.literal('playlist'),
	_id: z.string(),
	name: z.string(),
	description: z.string(),
	videos: z.array(z.string()).optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	owner: SearchOwnerSchema,
});

export const SearchResultSchema = z.discriminatedUnion('contentType', [
	SearchVideoResultSchema,
	SearchTweetResultSchema,
	SearchChannelResultSchema,
	SearchPlaylistResultSchema,
]);

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchResponseSchema = z.object({
	results: z.array(SearchResultSchema),
	page: z.number(),
	hasNextPage: z.boolean(),
	totalResults: z.number(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const SearchTypeSchema = z.enum([
	'all',
	'video',
	'channel',
	'playlist',
	'tweets',
]);

export type SearchType = z.infer<typeof SearchTypeSchema>;

export const SearchDateSchema = z.enum([
	'anytime',
	'today',
	'week',
	'month',
	'year',
]);

export type SearchDate = z.infer<typeof SearchDateSchema>;
