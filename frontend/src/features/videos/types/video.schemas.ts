import { z } from 'zod';

export const EnrichedVideoOwnerSchema = z.object({
	_id: z.string(),
	username: z.string(),
	fullName: z.string(),
	avatar: z.string().nullish().transform((v) => v ?? ''),
	subscribersCount: z.number().nullish().transform((v) => Math.max(0, v ?? 0)),
});

export type EnrichedVideoOwner = z.infer<typeof EnrichedVideoOwnerSchema>;

const RawVideoOwnerFallbackSchema = z.string().transform(
	(id): EnrichedVideoOwner => ({
		_id: id,
		username: 'creator',
		fullName: 'Nova Creator',
		avatar: '',
		subscribersCount: 0,
	}),
);

export const EnrichedVideoSchema = z.object({
	_id: z.string(),
	title: z.string(),
	description: z.string().nullish().transform((v) => v ?? ''),
	videoFile: z.string(),
	videoPublicId: z.string().nullish().transform((v) => v ?? ''),
	thumbnail: z.string(),
	thumbnailPublicId: z.string().nullish().transform((v) => v ?? ''),
	owner: z.union([EnrichedVideoOwnerSchema, RawVideoOwnerFallbackSchema]),
	duration: z.number(),
	views: z.number().nullish().transform((v) => Math.max(0, v ?? 0)),
	isPublished: z.boolean().nullish().transform((v) => v ?? true),
	isLiked: z.boolean().nullish().transform((v) => v ?? false),
	isSubscribed: z.boolean().nullish().transform((v) => v ?? false),
	likeCount: z.number().nullish().transform((v) => Math.max(0, v ?? 0)),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type EnrichedVideo = z.infer<typeof EnrichedVideoSchema>;
