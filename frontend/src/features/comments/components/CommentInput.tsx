import { useState } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAddComment } from '../hooks/useAddComment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { PaperPlaneRightIcon, SpinnerGapIcon } from '@phosphor-icons/react';

interface CommentInputProps {
	targetId: string;
}

export function CommentInput({ targetId }: CommentInputProps) {
	const { user, isAuthenticated } = useAuthStore();
	const addCommentMutation = useAddComment(targetId);
	const [content, setContent] = useState('');
	const [isFocused, setIsFocused] = useState(false);

	if (!isAuthenticated || !user) {
		return (
			<div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5">
				<p className="text-sm text-muted-foreground">Sign in to add a comment</p>
				<Link to="/login">
					<Button size="sm" variant="outline" className="rounded-full">
						Sign In
					</Button>
				</Link>
			</div>
		);
	}

	const initials = user.fullName
		?.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase() ?? 'U';

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || addCommentMutation.isPending) return;

		addCommentMutation.mutate(content.trim(), {
			onSuccess: () => {
				setContent('');
				setIsFocused(false);
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-3">
			<Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
				<AvatarImage src={user.avatar} alt={user.fullName} />
				<AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
					{initials}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-2">
				<Textarea
					placeholder="Add a comment..."
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onFocus={() => setIsFocused(true)}
					rows={isFocused ? 3 : 1}
					className="w-full resize-none rounded-xl border-border bg-muted/40 p-3 text-sm transition-all focus-visible:border-primary focus-visible:bg-background"
				/>

				{isFocused && (
					<div className="flex items-center justify-end gap-2 pt-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setContent('');
								setIsFocused(false);
							}}
							className="rounded-full text-xs"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={!content.trim() || addCommentMutation.isPending}
							className="gap-1.5 rounded-full px-4 text-xs font-semibold"
						>
							{addCommentMutation.isPending ? (
								<SpinnerGapIcon size={14} className="animate-spin" />
							) : (
								<PaperPlaneRightIcon size={14} weight="bold" />
							)}
							<span>Comment</span>
						</Button>
					</div>
				)}
			</div>
		</form>
	);
}
