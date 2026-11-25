import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchFilters } from '@/features/search/components/SearchFilters';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { useSearchResults } from '@/features/search/hooks/useSearchResults';
import type {
	SearchDate,
	SearchType,
} from '@/features/search/types/search.schemas';

export default function SearchPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const q = searchParams.get('q') ?? '';
	const tag = searchParams.get('tag') ?? '';
	const type = (searchParams.get('type') as SearchType) || 'all';
	const date = (searchParams.get('date') as SearchDate) || 'anytime';
	const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

	const normalizedTag = tag.trim().replace(/^#+/, '');
	const hasSearchCriteria = q.trim().length > 0 || normalizedTag.length > 0;
	const displayTerm = normalizedTag ? `#${normalizedTag}` : q.trim();

	const { data, isLoading, isError, error } = useSearchResults({
		q,
		tag: normalizedTag || undefined,
		type,
		date,
		page,
	});

	useEffect(() => {
		if (isError) {
			toast.error(error?.message || 'Failed to load search results');
		}
	}, [isError, error]);

	const results = data?.results ?? [];

	const setPage = (nextPage: number) => {
		const next = new URLSearchParams(searchParams);
		next.set('page', String(nextPage));
		setSearchParams(next);
	};

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						{displayTerm ? `Results for "${displayTerm}"` : 'Search'}
					</h1>
					{data && hasSearchCriteria ? (
						<p className="text-sm text-[var(--muted-foreground)]">
							{data.totalResults}{' '}
							{data.totalResults === 1 ? 'result' : 'results'} found
						</p>
					) : null}
				</header>

				<SearchFilters />

				{!hasSearchCriteria ? (
					<EmptyState
						icon={<MagnifyingGlassIcon size={40} />}
						title="Enter a search query"
						description="Search for videos, channels, playlists, or tweets."
					/>
				) : isLoading ? (
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-32 w-full rounded-2xl" />
						))}
					</div>
				) : isError ? (
					<EmptyState
						icon={<MagnifyingGlassIcon size={40} />}
						title="Search failed"
						description="Could not fetch results. Please try again."
					/>
				) : data?.totalResults === 0 || results.length === 0 ? (
					<EmptyState
						icon={<MagnifyingGlassIcon size={40} />}
						title="No results found"
						description={`No matches found for "${displayTerm}". Try adjusting your filters.`}
					/>
				) : (
					<>
						<div className="space-y-4">
							{results.map((result) => (
								<SearchResultCard
									key={`${result.contentType}-${result._id}`}
									result={result}
								/>
							))}
						</div>

						{page > 1 || data?.hasNextPage ? (
							<div className="flex items-center justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() => setPage(page - 1)}
								>
									Previous
								</Button>
								<span className="text-xs text-[var(--muted-foreground)]">
									Page {page}
								</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={!data?.hasNextPage}
									onClick={() => setPage(page + 1)}
								>
									Next
								</Button>
							</div>
						) : null}
					</>
				)}
			</div>
		</ErrorBoundary>
	);
}
