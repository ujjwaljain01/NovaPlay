import { z } from 'zod';

export const EnrichedCommentOwnerSchema = z.object({
	_id: z.string(),
	username: z.string(),
	fullName: z.string().optional().default(''),
	avatar: z.string(),
});

export type EnrichedCommentOwner = z.infer<typeof EnrichedCommentOwnerSchema>;

export const EnrichedCommentSchema = z.object({
	_id: z.string(),
	content: z.string(),
	targetType: z.enum(['Video', 'Tweet', 'Comment']).optional(),
	parentCommentId: z.string().nullable().optional(),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	replyCount: z.number().optional().default(0),
	repliesCount: z.number().optional(),
	likeCount: z.number().optional().default(0),
	isLiked: z.boolean().optional().default(false),
	isEdited: z.boolean().optional(),
	owner: EnrichedCommentOwnerSchema,
});

export type EnrichedComment = z.infer<typeof EnrichedCommentSchema>;

export const EnrichedCommentsResponseSchema = z.object({
	comments: z.array(EnrichedCommentSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

export type EnrichedCommentsResponse = z.infer<
	typeof EnrichedCommentsResponseSchema
>;

export const EnrichedCommentRepliesResponseSchema = z.object({
	replies: z.array(EnrichedCommentSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

export type EnrichedCommentRepliesResponse = z.infer<
	typeof EnrichedCommentRepliesResponseSchema
>;
