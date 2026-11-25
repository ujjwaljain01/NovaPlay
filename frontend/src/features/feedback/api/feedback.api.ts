import { apiClient, API } from '@/api';
import {
	feedbackRecordSchema,
	type FeedbackRecord,
	type SubmitFeedbackPayload,
} from '../types/feedback.schemas';

export async function submitFeedback(
	payload: SubmitFeedbackPayload,
): Promise<FeedbackRecord> {
	const response = await apiClient.post(API.feedback.submit, payload);
	const raw = response.data?.data ?? response.data;
	return feedbackRecordSchema.parse(raw);
}
