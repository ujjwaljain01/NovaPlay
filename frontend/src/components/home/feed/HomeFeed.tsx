import { useHomeFeed } from '@/features/home';

import { HOME_SECTIONS } from '@/constants/home-sections';

export function HomeFeed() {
	const {
		recommendedVideos,
		trendingVideos,
		latestVideos,
		// latestTweets,
		// developerTweets,
		isLoading,

		isError,
	} = useHomeFeed();

	if (isLoading) {
		return <div className="space-y-14">Loading...</div>;
	}

	if (isError) {
		return <div className="py-20 text-center">Unable to fetch feed.</div>;
	}

	return (
		<div className="space-y-14">
			{/* <VideoSection
				title={HOME_SECTIONS.RECOMMENDED}
				videos={recommendedVideos}
			/>

			{/* <TweetSection
				title={HOME_SECTIONS.LATEST_TWEETS}
				tweets={latestTweets}
			/> */}

			{/* <VideoSection
				title={HOME_SECTIONS.TRENDING}
				videos={trendingVideos}
			/> */}

			{/* <TweetSection
				title={HOME_SECTIONS.DEVELOPER_UPDATES}
				tweets={developerTweets}
			/> */}

			{/* 	<VideoSection title={HOME_SECTIONS.LATEST} videos={latestVideos} /> */}
		</div>
	);
}
