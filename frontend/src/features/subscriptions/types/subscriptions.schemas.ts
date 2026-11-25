import { z } from 'zod';

export const SubscriptionChannelSchema = z.object({
	_id: z.string(),
	channelName: z.string(),
	channelAvatar: z.string(),
});

export type SubscriptionChannel = z.infer<typeof SubscriptionChannelSchema>;

export const SubscriptionListSchema = z.array(SubscriptionChannelSchema);

export type SubscriptionList = z.infer<typeof SubscriptionListSchema>;

export const ToggleSubscriptionResponseSchema = z.object({
	subscribed: z.boolean(),
	channelId: z.string().optional(),
});

export type ToggleSubscriptionResponse = z.infer<
	typeof ToggleSubscriptionResponseSchema
>;

export const SubscribedChannelItemSchema = z.object({
	_id: z.string(),
	username: z.string(),
	fullName: z.string(),
	avatar: z.string().nullish().transform((v) => v ?? ''),
});

export type SubscribedChannelItem = z.infer<typeof SubscribedChannelItemSchema>;

export const SubscribedChannelsPageSchema = z.object({
	channels: z.array(SubscribedChannelItemSchema),
	totalCount: z.number(),
	hasMore: z.boolean(),
});

export type SubscribedChannelsPage = z.infer<
	typeof SubscribedChannelsPageSchema
>;

const FeedOwnerSchema = z
	.object({
		_id: z.string(),
		username: z.string(),
		fullName: z.string(),
		avatar: z.string().nullish().transform((v) => v ?? ''),
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

export const SubscriptionFeedVideoItemSchema = z.object({
	_id: z.string(),
	feedType: z.literal('video'),
	createdAt: z.string(),
	owner: FeedOwnerSchema,
	title: z.string(),
	thumbnail: z.string(),
	duration: z.number(),
	views: z.number().default(0),
});

export type SubscriptionFeedVideoItem = z.infer<
	typeof SubscriptionFeedVideoItemSchema
>;

export const SubscriptionFeedTweetItemSchema = z.object({
	_id: z.string(),
	feedType: z.literal('tweet'),
	createdAt: z.string(),
	owner: FeedOwnerSchema,
	content: z.string(),
	views: z.number().optional().default(0),
	likesCount: z.number().optional().default(0),
	commentsCount: z.number().optional().default(0),
	isLiked: z.boolean().optional().default(false),
});

export type SubscriptionFeedTweetItem = z.infer<
	typeof SubscriptionFeedTweetItemSchema
>;

export const SubscriptionFeedItemSchema = z.discriminatedUnion('feedType', [
	SubscriptionFeedVideoItemSchema,
	SubscriptionFeedTweetItemSchema,
]);

export type SubscriptionFeedItem = z.infer<typeof SubscriptionFeedItemSchema>;

export const SubscriptionFeedResponseSchema = z.object({
	items: z.array(SubscriptionFeedItemSchema),
	hasMore: z.boolean(),
	nextOffset: z.number().nullable(),
});

export type SubscriptionFeedResponse = z.infer<
	typeof SubscriptionFeedResponseSchema
>;
