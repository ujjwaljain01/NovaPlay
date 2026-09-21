import { useHomeFeed } from '@/features/home';
import { HOME_SECTIONS } from '@/constants/home-sections';
import { VideoSection, VideoSectionSkeleton } from '@/features/videos';
import { TweetSection, TweetSectionSkeleton } from '@/features/tweets';
import { Button } from '@/components/ui/button';
import { ArrowClockwiseIcon, SparkleIcon, FireIcon, VideoCameraIcon } from '@phosphor-icons/react';

export function HomeFeed() {
	const {
		recommendedVideos,
		latestTweets,
		trendingVideos,
		communityTweets,
		latestVideos,
		isLoading,
		isError,
	} = useHomeFeed();

	if (isLoading) {
		return (
			<div className="space-y-12">
				<VideoSectionSkeleton count={3} />
				<TweetSectionSkeleton count={4} />
				<VideoSectionSkeleton count={3} />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
					<ArrowClockwiseIcon size={32} />
				</div>
				<h3 className="text-lg font-semibold text-foreground">Unable to fetch feed</h3>
				<p className="mt-1 text-sm text-muted-foreground max-w-sm">
					Please check your connection or server status and try again.
				</p>
				<Button
					onClick={() => window.location.reload()}
					variant="outline"
					className="mt-4 rounded-xl gap-2"
				>
					<ArrowClockwiseIcon size={16} />
					<span>Reload Page</span>
				</Button>
			</div>
		);
	}

	const hasVideos = recommendedVideos.length > 0 || trendingVideos.length > 0 || latestVideos.length > 0;
	const hasTweets = latestTweets.length > 0 || communityTweets.length > 0;

	if (!hasVideos && !hasTweets) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
					<SparkleIcon size={32} />
				</div>
				<h3 className="text-xl font-bold text-foreground">Welcome to NovaPlay</h3>
				<p className="mt-2 text-sm text-muted-foreground max-w-md">
					No videos or tweets have been published yet. Be the pioneer creator and upload the very first story!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-12 pb-16">
			{/* Section 1: Recommended Videos */}
			{recommendedVideos.length > 0 && (
				<VideoSection
					title={HOME_SECTIONS.RECOMMENDED}
					videos={recommendedVideos}
					viewAllHref="/videos"
					icon={<SparkleIcon size={22} weight="fill" />}
				/>
			)}

			{/* Section 2: Latest Tweets */}
			{latestTweets.length > 0 && (
				<TweetSection
					title={HOME_SECTIONS.LATEST_TWEETS}
					tweets={latestTweets}
					viewAllHref="/tweets"
				/>
			)}

			{/* Section 3: Trending Videos */}
			{trendingVideos.length > 0 && (
				<VideoSection
					title={HOME_SECTIONS.TRENDING}
					videos={trendingVideos}
					viewAllHref="/trending"
					icon={<FireIcon size={22} weight="fill" className="text-rose-500" />}
				/>
			)}

			{/* Section 4: Community Updates */}
			{communityTweets.length > 0 && (
				<TweetSection
					title="Community Updates"
					tweets={communityTweets}
					viewAllHref="/tweets"
				/>
			)}

			{/* Section 5: Latest Videos */}
			{latestVideos.length > 0 && (
				<VideoSection
					title={HOME_SECTIONS.LATEST}
					videos={latestVideos}
					viewAllHref="/videos"
					icon={<VideoCameraIcon size={22} weight="fill" />}
				/>
			)}
		</div>
	);
}
