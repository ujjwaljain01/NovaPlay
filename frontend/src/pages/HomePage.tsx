import { FeedFilters } from '@/components/home/filters';
import { HomeFeed } from '@/components/home/feed/HomeFeed';

export default function HomePage() {
	return (
		<div className="space-y-6 px-4 py-3 sm:px-6">
			<FeedFilters />
			<HomeFeed />
		</div>
	);
}
