import type { VideoCardData } from '@/types/video.types';
import type { Tweet } from '@/types/tweet.types';
import type { HomeFeedData } from './home.types';

interface BuildHomeFeedOptions {
	videos: VideoCardData[];
	tweets: Tweet[];
	isLoading: boolean;
	isError: boolean;
}

const SECTION_CONFIG = [
	{ key: 'recommendedVideos', source: 'videos', start: 0, end: 3 },
	{ key: 'latestTweets', source: 'tweets', start: 0, end: 4 },
	{ key: 'trendingVideos', source: 'videos', start: 3, end: 6 },
	{ key: 'communityTweets', source: 'tweets', start: 4, end: 8 },
	{ key: 'latestVideos', source: 'videos', start: 6, end: 9 },
] as const;

export function buildHomeFeed({
	videos,
	tweets,
	isLoading,
	isError,
}: BuildHomeFeedOptions): HomeFeedData {
	const sections: Partial<HomeFeedData> = {};

	for (const section of SECTION_CONFIG) {
		if (section.source === 'videos') {
			sections[section.key] = videos.slice(section.start, section.end);
		} else {
			sections[section.key] = tweets.slice(section.start, section.end);
		}
	}

	return {
		recommendedVideos: sections.recommendedVideos ?? [],
		latestTweets: sections.latestTweets ?? [],
		trendingVideos: sections.trendingVideos ?? [],
		communityTweets: sections.communityTweets ?? [],
		latestVideos: sections.latestVideos ?? [],
		isLoading,
		isError,
	};
}
