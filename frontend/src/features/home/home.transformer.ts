import type { VideoCardData } from '@/types/video.types';
import type { Tweet } from '@/types/tweet.types';
import type { HomeFeedData } from './home.types';

interface BuildHomeFeedOptions {
	videos: VideoCardData[];
	tweets: Tweet[];
	isLoading: boolean;
	isError: boolean;
}

export function buildHomeFeed({
	videos,
	tweets,
	isLoading,
	isError,
}: BuildHomeFeedOptions): HomeFeedData {
	return {
		recommendedVideos: videos.slice(0, 3),
		latestTweets: tweets.slice(0, 4),
		trendingVideos: videos.slice(3, 6),
		communityTweets: tweets.slice(4, 8),
		latestVideos: videos.slice(6, 9),
		isLoading,
		isError,
	};
}
