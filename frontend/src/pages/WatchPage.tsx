import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
	useVideo,
	useVideoLike,
	useVideoWatchTracker,
	VideoPlayer,
	VideoInfoBar,
	CreatorDescriptionSection,
	RecommendationsSidebar,
	WatchPageSkeleton,
} from '@/features/videos';
import { useToggleSubscription } from '@/features/subscriptions/hooks/useToggleSubscription';
import { CommentSection } from '@/features/comments/components/CommentSection';
import { useAuthStore } from '@/features/auth/auth.store';
import { usePlaybackSettingsStore } from '@/store/playback-settings.store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function WatchPage() {
	const { videoId } = useParams<{ videoId: string }>();
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const autoplay = usePlaybackSettingsStore((s) => s.autoplay);

	const { data: video, isLoading, isError, refetch } = useVideo(videoId ?? '');
	const likeMutation = useVideoLike(video?._id ?? '');
	const toggleSubscriptionMutation = useToggleSubscription();
	const playbackHandlers = useVideoWatchTracker({
		videoId: video?._id ?? '',
		isAuthenticated,
	});

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [videoId]);

	if (isLoading) return <WatchPageSkeleton />;

	if (isError || !video) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center">
				<h2 className="text-2xl font-bold text-foreground">Video not found</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					This video may have been removed or the link is broken.
				</p>
				<div className="mt-4 flex items-center gap-3">
					<Button
						variant="secondary"
						onClick={() => refetch()}
						className="rounded-xl"
					>
						Retry
					</Button>
					<Link to="/">
						<Button variant="outline" className="rounded-xl">
							Back to Home
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const ownerObj =
		typeof video.owner === 'object' && video.owner !== null ? video.owner : null;
	const isOwnChannel = Boolean(
		user?._id && ownerObj?._id && user._id === ownerObj._id,
	);

	const handleToggleLike = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to like this video');
			return;
		}
		likeMutation.mutate();
	};

	const handleSubscribe = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to subscribe');
			navigate('/login');
			return;
		}
		if (!ownerObj?._id || isOwnChannel) return;
		toggleSubscriptionMutation.mutate({
			channelId: ownerObj._id,
			username: ownerObj.username,
			videoId: video._id,
		});
	};

	return (
		<div className="mx-auto max-w-[1800px] px-4 py-4 lg:px-6">
			<div className="flex flex-col gap-6 xl:flex-row">
				<div className="min-w-0 flex-1 space-y-4">
					<VideoPlayer
						key={video._id}
						src={video.videoFile}
						title={video.title}
						poster={video.thumbnail}
						autoPlay={autoplay}
						onPlay={playbackHandlers.onPlay}
						onPlaying={playbackHandlers.onPlaying}
						onPause={playbackHandlers.onPause}
						onWaiting={playbackHandlers.onWaiting}
						onSeeking={playbackHandlers.onSeeking}
						onSeeked={playbackHandlers.onSeeked}
						onEnded={playbackHandlers.onEnded}
					/>

					<VideoInfoBar
						title={video.title}
						views={video.views}
						createdAt={video.createdAt}
						likeCount={video.likeCount}
						isLiked={video.isLiked}
						isAuthenticated={isAuthenticated}
						isLikePending={likeMutation.isPending}
						onToggleLike={handleToggleLike}
					/>

					<CreatorDescriptionSection
						owner={ownerObj}
						views={video.views}
						createdAt={video.createdAt}
						description={video.description}
						isSubscribed={video.isSubscribed}
						isOwnChannel={isOwnChannel}
						isSubscribing={toggleSubscriptionMutation.isPending}
						onSubscribe={handleSubscribe}
					/>

					<Separator className="bg-border/50" />

					<CommentSection targetId={video._id} />
				</div>

				<aside className="w-full shrink-0 xl:w-[400px]">
					<RecommendationsSidebar currentVideoId={video._id} />
				</aside>
			</div>
		</div>
	);
}
