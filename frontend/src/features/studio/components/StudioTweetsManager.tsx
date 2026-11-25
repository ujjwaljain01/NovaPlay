import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	ChatCircleIcon,
	FeatherIcon,
	HeartIcon,
	PencilSimpleIcon,
	TrashIcon,
} from '@phosphor-icons/react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { TWEET_MAX_LENGTH } from '@/constants/tweet';
import { TweetComposer } from '@/features/tweets/components/TweetComposer';
import { useDeleteTweet } from '@/features/tweets/hooks/useDeleteTweet';
import { useUpdateTweet } from '@/features/tweets/hooks/useUpdateTweet';
import { useUserTweets } from '@/features/tweets/hooks/useUserTweets';
import type { Tweet } from '@/features/tweets/types/tweet.types';
import { formatUploadTime } from '@/lib/format-upload-time';

interface StudioTweetsManagerProps {
	userId: string;
}

export function StudioTweetsManager({ userId }: StudioTweetsManagerProps) {
	const { data: tweets = [], isLoading, isError } = useUserTweets(userId, true);
	const updateTweetMutation = useUpdateTweet();
	const deleteTweetMutation = useDeleteTweet();

	const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState('');
	const [deletingTweet, setDeletingTweet] = useState<Tweet | null>(null);

	const startEdit = (tweet: Tweet) => {
		setEditingTweetId(tweet._id);
		setEditContent(tweet.content);
	};

	const cancelEdit = () => {
		setEditingTweetId(null);
		setEditContent('');
	};

	const saveEdit = (tweetId: string) => {
		const trimmed = editContent.trim();
		if (!trimmed) return;

		updateTweetMutation.mutate(
			{ tweetId, content: trimmed },
			{
				onSuccess: () => {
					cancelEdit();
				},
			},
		);
	};

	return (
		<div className="space-y-6">
			<TweetComposer placeholder="Share an update with your subscribers..." />

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-24 w-full rounded-2xl bg-[var(--skeleton)]"
						/>
					))}
				</div>
			) : isError ? (
				<EmptyState
					icon={<FeatherIcon size={40} />}
					title="Unable to load your tweets"
					description="Please refresh or try again in a moment."
				/>
			) : tweets.length === 0 ? (
				<EmptyState
					icon={<FeatherIcon size={40} />}
					title="No tweets posted yet"
					description="Publish your first tweet above to engage your community."
				/>
			) : (
				<div className="space-y-3">
					{tweets.map((tweet) => {
						const isEditing = editingTweetId === tweet._id;

						return (
							<article
								key={tweet._id}
								className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
							>
								{isEditing ? (
									<div className="space-y-3">
										<Textarea
											value={editContent}
											onChange={(e) => setEditContent(e.target.value)}
											rows={3}
											maxLength={TWEET_MAX_LENGTH}
										/>
										<div className="flex items-center justify-between">
											<span className="text-xs text-[var(--muted-foreground)]">
												{TWEET_MAX_LENGTH - editContent.length} characters left
											</span>
											<div className="flex items-center gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={cancelEdit}
													disabled={updateTweetMutation.isPending}
												>
													Cancel
												</Button>
												<Button
													type="button"
													size="sm"
													onClick={() => saveEdit(tweet._id)}
													disabled={
														!editContent.trim() || updateTweetMutation.isPending
													}
												>
													{updateTweetMutation.isPending ? 'Saving...' : 'Save'}
												</Button>
											</div>
										</div>
									</div>
								) : (
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0 flex-1 space-y-2">
											<Link
												to={`/tweets/${tweet._id}`}
												className="block whitespace-pre-wrap text-sm text-[var(--foreground)] hover:text-[var(--primary)]"
											>
												{tweet.content}
											</Link>
											<div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
												<span>{formatUploadTime(tweet.createdAt)}</span>
												<span className="inline-flex items-center gap-1">
													<HeartIcon size={13} />
													{tweet.likesCount ?? 0}
												</span>
												<span className="inline-flex items-center gap-1">
													<ChatCircleIcon size={13} />
													{tweet.commentsCount ?? 0}
												</span>
											</div>
										</div>

										<div className="flex shrink-0 items-center gap-1.5">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => startEdit(tweet)}
												className="gap-1.5"
											>
												<PencilSimpleIcon size={14} />
												<span>Edit</span>
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setDeletingTweet(tweet)}
												className="gap-1.5 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
											>
												<TrashIcon size={14} />
												<span>Delete</span>
											</Button>
										</div>
									</div>
								)}
							</article>
						);
					})}
				</div>
			)}

			<Dialog
				open={!!deletingTweet}
				onOpenChange={(open) => {
					if (!open) setDeletingTweet(null);
				}}
			>
				<DialogContent className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete tweet</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this tweet? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeletingTweet(null)}
							disabled={deleteTweetMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={deleteTweetMutation.isPending}
							onClick={() => {
								if (!deletingTweet) return;
								deleteTweetMutation.mutate(deletingTweet._id, {
									onSuccess: () => setDeletingTweet(null),
								});
							}}
						>
							{deleteTweetMutation.isPending ? 'Deleting...' : 'Delete'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
