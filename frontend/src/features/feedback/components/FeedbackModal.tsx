import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FlagIcon } from '@phosphor-icons/react';
import { useLocation } from 'react-router-dom';
import { FormMessage } from '@/components/form/FormMessage';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useFeedbackModalStore } from '@/store/feedback-modal.store';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import {
	feedbackFormSchema,
	MAX_FEEDBACK_MESSAGE_LENGTH,
	type FeedbackFormValues,
} from '../types/feedback.schemas';

const CATEGORY_OPTIONS = [
	{ value: 'general', label: 'General Feedback' },
	{ value: 'bug', label: 'Bug Report' },
	{ value: 'feature', label: 'Feature Request' },
] as const;

export function FeedbackModal() {
	const isOpen = useFeedbackModalStore((s) => s.isOpen);
	const setOpen = useFeedbackModalStore((s) => s.setOpen);
	const close = useFeedbackModalStore((s) => s.close);
	const { pathname } = useLocation();
	const submitMutation = useSubmitFeedback();

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FeedbackFormValues>({
		resolver: zodResolver(feedbackFormSchema),
		defaultValues: {
			category: 'general',
			message: '',
		},
	});

	const messageValue = useWatch({ control, name: 'message' }) ?? '';

	const onSubmit = (values: FeedbackFormValues) => {
		const pageUrl =
			typeof window !== 'undefined' ? window.location.pathname : pathname;

		submitMutation.mutate(
			{
				category: values.category,
				message: values.message.trim(),
				pageUrl,
			},
			{
				onSuccess: () => {
					reset({ category: 'general', message: '' });
					close();
				},
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-md border border-border bg-popover text-popover-foreground">
				<DialogHeader>
					<div className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<FlagIcon size={18} weight="duotone" />
						</div>
						<div>
							<DialogTitle>Send Feedback</DialogTitle>
							<DialogDescription>
								Help us improve NovaPlay by sharing bugs, ideas, or thoughts.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="feedback-category">Category</Label>
						<select
							id="feedback-category"
							{...register('category')}
							className={cn(
								'h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors',
								'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
							)}
						>
							{CATEGORY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<FormMessage message={errors.category?.message} />
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between gap-2">
							<Label htmlFor="feedback-message">Message</Label>
							<span className="text-xs text-muted-foreground">
								{messageValue.length}/{MAX_FEEDBACK_MESSAGE_LENGTH}
							</span>
						</div>
						<Textarea
							id="feedback-message"
							rows={4}
							maxLength={MAX_FEEDBACK_MESSAGE_LENGTH}
							placeholder="Describe what happened, what you expected, or what you'd like to see..."
							aria-invalid={Boolean(errors.message)}
							{...register('message')}
						/>
						<FormMessage message={errors.message?.message} />
					</div>

					<div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
						<span>Captured page</span>
						<code className="truncate font-mono text-foreground">
							{pathname}
						</code>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={close}
							disabled={submitMutation.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitMutation.isPending}>
							{submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
