import { z } from 'zod';

export const FEEDBACK_CATEGORIES = ['bug', 'feature', 'general'] as const;
export const MAX_FEEDBACK_MESSAGE_LENGTH = 2000;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const feedbackFormSchema = z.object({
	category: z.enum(FEEDBACK_CATEGORIES),
	message: z
		.string()
		.trim()
		.min(1, 'Please describe your feedback before submitting.')
		.max(
			MAX_FEEDBACK_MESSAGE_LENGTH,
			`Feedback must be ${MAX_FEEDBACK_MESSAGE_LENGTH} characters or less.`,
		),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export interface SubmitFeedbackPayload extends FeedbackFormValues {
	pageUrl: string;
}

export const feedbackRecordSchema = z.object({
	_id: z.string(),
	user: z.string().nullable().optional(),
	category: z.enum(FEEDBACK_CATEGORIES),
	message: z.string(),
	pageUrl: z.string().optional(),
	status: z.enum(['open', 'reviewed', 'resolved']).optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type FeedbackRecord = z.infer<typeof feedbackRecordSchema>;
