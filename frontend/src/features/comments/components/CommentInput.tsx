import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAddComment } from '../hooks/useAddComment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { PaperPlaneRightIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface CommentInputProps {
	targetId?: string;
	onSubmitContent?: (
		content: string,
		callbacks: { onSuccess: () => void },
	) => void;
	isPending?: boolean;
	initialContent?: string;
	placeholder?: string;
	submitLabel?: string;
	autoFocus?: boolean;
	defaultExpanded?: boolean;
	onCancel?: () => void;
	compact?: boolean;
}

export function CommentInput({
	targetId = '',
	onSubmitContent,
	isPending: isPendingProp,
	initialContent = '',
	placeholder = 'Add a comment...',
	submitLabel = 'Comment',
	autoFocus = false,
	defaultExpanded = false,
	onCancel,
	compact = false,
}: CommentInputProps) {
	const { user, isAuthenticated } = useAuthStore();
	const addCommentMutation = useAddComment(targetId);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [content, setContent] = useState(initialContent);
	const [prevInitialContent, setPrevInitialContent] = useState(initialContent);
	const [isFocused, setIsFocused] = useState(defaultExpanded);

	if (initialContent !== prevInitialContent) {
		setPrevInitialContent(initialContent);
		setContent(initialContent);
	}

	useEffect(() => {
		if (!autoFocus) return;
		const el = textareaRef.current;
		if (!el) return;
		el.focus();
		const length = el.value.length;
		el.setSelectionRange(length, length);
	}, [autoFocus]);

	const isPending = isPendingProp ?? addCommentMutation.isPending;

	if (!isAuthenticated || !user) {
		return (
			<div className="flex items-center justify-between rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/30 p-3.5">
				<p className="text-sm text-[var(--muted-foreground)]">
					Sign in to add a comment
				</p>
				<Link to="/login">
					<Button size="sm" variant="outline" className="rounded-full">
						Sign In
					</Button>
				</Link>
			</div>
		);
	}

	const initials =
		user.fullName
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() ?? 'U';

	const resetInput = () => {
		setContent('');
		setIsFocused(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = content.trim();
		if (!trimmed || isPending) return;

		if (onSubmitContent) {
			onSubmitContent(trimmed, { onSuccess: resetInput });
			return;
		}

		addCommentMutation.mutate(trimmed, {
			onSuccess: resetInput,
		});
	};

	const handleCancel = () => {
		resetInput();
		onCancel?.();
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-3">
			<Avatar
				className={cn(
					'shrink-0 ring-1 ring-[var(--border)]',
					compact ? 'h-7 w-7' : 'h-9 w-9',
				)}
			>
				<AvatarImage src={user.avatar} alt={user.fullName} />
				<AvatarFallback className="bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
					{initials}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-2">
				<Textarea
					ref={textareaRef}
					placeholder={placeholder}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onFocus={() => setIsFocused(true)}
					autoFocus={autoFocus}
					maxLength={320}
					rows={isFocused ? (compact ? 2 : 3) : 1}
					className={cn(
						'w-full resize-none rounded-xl border-[var(--border)] bg-[var(--muted)]/40 text-sm text-[var(--foreground)] transition-all focus-visible:border-[var(--primary)] focus-visible:bg-[var(--background)]',
						compact ? 'p-2.5' : 'p-3',
					)}
				/>

				{isFocused && (
					<div className="flex items-center justify-end gap-2 pt-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={isPending}
							onClick={handleCancel}
							className="rounded-full text-xs"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={!content.trim() || isPending}
							className="gap-1.5 rounded-full px-4 text-xs font-semibold"
						>
							{isPending ? (
								<SpinnerGapIcon size={14} className="animate-spin" />
							) : (
								<PaperPlaneRightIcon size={14} weight="bold" />
							)}
							<span>{submitLabel}</span>
						</Button>
					</div>
				)}
			</div>
		</form>
	);
}
