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
