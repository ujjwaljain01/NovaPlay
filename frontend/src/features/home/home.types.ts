import type { VideoCardData } from '@/types/video.types';
import type { Tweet } from '@/types/tweet.types';

export interface HomeFeedData {
	recommendedVideos: VideoCardData[];
	latestTweets: Tweet[];
	trendingVideos: VideoCardData[];
	communityTweets: Tweet[];
	latestVideos: VideoCardData[];
	isLoading: boolean;
	isError: boolean;
}
