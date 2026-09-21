import { useVideos, transformVideosToCardData } from '@/features/videos';
import { useTweets } from '@/features/tweets';
import { buildHomeFeed } from './home.transformer';

export function useHomeFeed() {
	const {
		data: videosData,
		isLoading: isVideosLoading,
		isError: isVideosError,
	} = useVideos({
		limit: 12,
	});

	const {
		data: tweetsData,
		isLoading: isTweetsLoading,
		isError: isTweetsError,
	} = useTweets({
		limit: 8,
	});

	const rawVideos = videosData?.docs ?? [];
	const videos = transformVideosToCardData(rawVideos);
	const tweets = tweetsData?.docs ?? [];

	return buildHomeFeed({
		videos,
		tweets,
		isLoading: isVideosLoading || isTweetsLoading,
		isError: isVideosError && isTweetsError,
	});
}
