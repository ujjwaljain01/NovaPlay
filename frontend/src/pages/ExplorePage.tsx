import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
	CompassIcon,
	FireIcon,
	GameControllerIcon,
	MusicNotesIcon,
	NewspaperIcon,
	TrophyIcon,
	type Icon,
} from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
	EXPLORE_CATEGORIES,
	type ExploreCategory,
	type ExploreContentType,
	type ExploreFeedItem,
	useExploreFeed,
} from '@/features/explore';
import { TweetCard } from '@/features/tweets/components/TweetCard';
import { VideoCard } from '@/features/videos/components/VideoCard';
import { VideoCardSkeleton } from '@/features/videos/components/VideoCardSkeleton';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';

const CATEGORY_META: Record<
	ExploreCategory,
	{ title: string; description: string; icon: Icon }
> = {
	trending: {
		title: 'Trending',
		description: 'Videos and tweets gaining velocity right now.',
		icon: FireIcon,
	},
	gaming: {
		title: 'Gaming',
		description: 'Gameplay highlights, esports, streams, and gaming posts.',
		icon: GameControllerIcon,
	},
	sports: {
		title: 'Sports',
		description: 'Match moments, analysis, and sports community updates.',
		icon: TrophyIcon,
	},
	music: {
		title: 'Music',
		description: 'Performances, releases, mixes, and music conversations.',
		icon: MusicNotesIcon,
	},
	news: {
		title: 'News',
		description: 'Breaking updates, commentary, and current headlines.',
		icon: NewspaperIcon,
	},
};

const TYPE_PILLS: Array<{ value: ExploreContentType; label: string }> = [
	{ value: 'all', label: 'All' },
	{ value: 'videos', label: 'Videos' },
	{ value: 'tweets', label: 'Tweets' },
];

function parseCategory(raw?: string): ExploreCategory | null {
	const normalized = (raw ?? '').trim().toLowerCase();
	if ((EXPLORE_CATEGORIES as readonly string[]).includes(normalized)) {
		return normalized as ExploreCategory;
	}
	return null;
}

function parseContentType(raw: string | null): ExploreContentType {
	if (raw === 'videos' || raw === 'tweets') return raw;
	return 'all';
}

export default function ExplorePage() {
	const { category: rawCategory } = useParams<{ category: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const category = parseCategory(rawCategory);
	const contentType = parseContentType(searchParams.get('type'));

	const {
		data,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		refetch,
	} = useExploreFeed(category, contentType);

	const items = useMemo(() => {
		const seen = new Set<string>();
		const flattened: ExploreFeedItem[] = [];

		for (const page of data?.pages ?? []) {
			for (const item of page.items) {
				const key = `${item.feedType}-${item._id}`;
				if (!seen.has(key)) {
					seen.add(key);
					flattened.push(item);
				}
			}
		}

		return flattened;
	}, [data]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void fetchNextPage();
				}
			},
			{ rootMargin: '200px' },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleTypeChange = (nextType: ExploreContentType) => {
		const nextParams = new URLSearchParams(searchParams);
		if (nextType === 'all') {
			nextParams.delete('type');
		} else {
			nextParams.set('type', nextType);
		}
		setSearchParams(nextParams);
	};

	if (!category) {
		return (
			<ErrorBoundary>
				<div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
					<EmptyState
						icon={<CompassIcon size={44} />}
						title="Unsupported explore category"
						description="Choose Trending, Gaming, Sports, Music, or News to browse curated feeds."
						action={
							<div className="flex flex-wrap items-center justify-center gap-2">
								<Link to="/explore/trending">
									<Button className="rounded-full">
										Go to Trending
									</Button>
								</Link>
								<Link to={ROUTES.HOME}>
									<Button
										variant="outline"
										className="rounded-full"
									>
										Back to Home
									</Button>
								</Link>
							</div>
						}
					/>
				</div>
			</ErrorBoundary>
		);
	}

	const meta = CATEGORY_META[category];
	const CategoryIcon = meta.icon;

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex items-start gap-3.5">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
							<CategoryIcon size={24} weight="duotone" />
						</span>
						<div className="space-y-1">
							<h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
								{meta.title}
							</h1>
							<p className="text-sm text-[var(--muted-foreground)]">
								{meta.description}
							</p>
						</div>
					</div>

					<div
						role="group"
						aria-label="Filter explore content type"
						className="flex flex-wrap items-center gap-1.5"
					>
						{TYPE_PILLS.map((pill) => {
							const isActive = contentType === pill.value;
							return (
								<button
									key={pill.value}
									type="button"
									aria-pressed={isActive}
									onClick={() => handleTypeChange(pill.value)}
									className={cn(
										'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
										isActive
											? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
											: 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
									)}
								>
									{pill.label}
								</button>
							);
						})}
					</div>
				</header>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<VideoCardSkeleton key={i} />
						))}
					</div>
				) : isError ? (
					<EmptyState
						icon={<CategoryIcon size={40} />}
						title={`Unable to load ${meta.title} feed`}
						description="Something went wrong while fetching explore content."
						action={
							<Button
								variant="outline"
								onClick={() => void refetch()}
								className="rounded-full"
							>
								Try again
							</Button>
						}
					/>
				) : items.length === 0 ? (
					<EmptyState
						icon={<CategoryIcon size={40} />}
						title={`No ${meta.title.toLowerCase()} posts yet`}
						description={
							contentType === 'all'
								? `No videos or tweets tagged for ${meta.title.toLowerCase()} yet.`
								: `No ${contentType} found in ${meta.title.toLowerCase()} yet.`
						}
					/>
				) : (
					<>
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{items.map((item) =>
								item.feedType === 'video' ? (
									<VideoCard
										key={`video-${item._id}`}
										video={{
											_id: item._id,
											title: item.title,
											thumbnail: item.thumbnail,
											duration: item.duration,
											views: item.views,
											createdAt: item.createdAt,
											owner: item.owner,
										}}
									/>
								) : (
									<TweetCard
										key={`tweet-${item._id}`}
										tweet={{
											_id: item._id,
											content: item.content,
											createdAt: item.createdAt,
											owner: item.owner,
											views: item.views,
											likesCount: item.likesCount,
											commentsCount: item.commentsCount,
											isLiked: item.isLiked,
										}}
									/>
								),
							)}
						</div>

						{hasNextPage && (
							<div
								ref={sentinelRef}
								className="flex justify-center pt-4"
							>
								<Button
									type="button"
									variant="outline"
									onClick={() => void fetchNextPage()}
									disabled={isFetchingNextPage}
									className="rounded-full"
								>
									{isFetchingNextPage
										? 'Loading more...'
										: 'Load more'}
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</ErrorBoundary>
	);
}
