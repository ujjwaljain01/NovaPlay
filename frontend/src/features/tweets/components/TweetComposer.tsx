import { useState } from 'react';
import { PaperPlaneRightIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCreateTweet } from '../hooks/useCreateTweet';
import { Link } from 'react-router-dom';

interface TweetComposerProps {
	placeholder?: string;
	onSuccess?: () => void;
}

export function TweetComposer({
	placeholder = "What's happening on your mind?",
	onSuccess,
}: TweetComposerProps) {
	const { user, isAuthenticated } = useAuthStore();
	const createTweetMutation = useCreateTweet();
	const [content, setContent] = useState('');

	if (!isAuthenticated || !user) {
		return (
			<div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm">
				<p className="text-sm text-muted-foreground">
					Sign in to join the conversation and post updates.
				</p>
				<Link to="/login">
					<Button size="sm" className="rounded-full font-medium">
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
		if (!content.trim() || createTweetMutation.isPending) return;

		createTweetMutation.mutate(content.trim(), {
			onSuccess: () => {
				setContent('');
				onSuccess?.();
			},
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm backdrop-blur-sm transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
		>
			<div className="flex gap-3">
				<Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
					<AvatarImage src={user.avatar} alt={user.fullName} />
					<AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1">
					<Textarea
						placeholder={placeholder}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={3}
						className="w-full resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground/70"
						maxLength={300}
					/>

					<div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
						<span className="text-xs text-muted-foreground">
							{300 - content.length} characters left
						</span>

						<Button
							type="submit"
							size="sm"
							disabled={!content.trim() || createTweetMutation.isPending}
							className="gap-2 rounded-full px-4"
						>
							{createTweetMutation.isPending ? (
								<SpinnerGapIcon size={16} className="animate-spin" />
							) : (
								<PaperPlaneRightIcon size={16} weight="bold" />
							)}
							<span>Post</span>
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
