import { z } from 'zod';

export const LikedVideoOwnerSchema = z.object({
	_id: z.string(),
	username: z.string(),
	fullName: z.string().optional(),
	avatar: z.string(),
});

export type LikedVideoOwner = z.infer<typeof LikedVideoOwnerSchema>;

export const LikedVideoSchema = z.object({
	_id: z.string(),
	title: z.string(),
	thumbnail: z.string(),
	duration: z.number(),
	views: z.number().optional(),
	createdAt: z.string().optional(),
	owner: LikedVideoOwnerSchema,
});

export type LikedVideo = z.infer<typeof LikedVideoSchema>;

export const LikedVideosListSchema = z.array(LikedVideoSchema);

export type LikedVideosList = z.infer<typeof LikedVideosListSchema>;
