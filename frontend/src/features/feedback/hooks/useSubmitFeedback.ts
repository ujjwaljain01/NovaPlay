import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { submitFeedback } from '../api/feedback.api';
import type { SubmitFeedbackPayload } from '../types/feedback.schemas';

function getErrorMessage(error: unknown): string {
	if (isAxiosError<{ message?: string }>(error)) {
		return (
			error.response?.data?.message ||
			error.message ||
			'Failed to submit feedback'
		);
	}
	if (error instanceof Error) {
		return error.message;
	}
	return 'Failed to submit feedback';
}

export function useSubmitFeedback() {
	return useMutation({
		mutationFn: (payload: SubmitFeedbackPayload) => submitFeedback(payload),
		onSuccess: () => {
			toast.success('Feedback submitted. Thank you!');
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}
