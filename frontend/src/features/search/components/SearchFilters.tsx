import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { SearchDate, SearchType } from '../types/search.schemas';

const TYPE_OPTIONS: Array<{ value: SearchType; label: string }> = [
	{ value: 'all', label: 'All' },
	{ value: 'video', label: 'Videos' },
	{ value: 'channel', label: 'Channels' },
	{ value: 'playlist', label: 'Playlists' },
	{ value: 'tweets', label: 'Tweets' },
];

const DATE_OPTIONS: Array<{ value: SearchDate; label: string }> = [
	{ value: 'anytime', label: 'Anytime' },
	{ value: 'today', label: 'Today' },
	{ value: 'week', label: 'This week' },
	{ value: 'month', label: 'This month' },
	{ value: 'year', label: 'This year' },
];

export function SearchFilters() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeType = (searchParams.get('type') as SearchType) || 'all';
	const activeDate = (searchParams.get('date') as SearchDate) || 'anytime';

	const updateParam = (key: 'type' | 'date', value: string) => {
		const next = new URLSearchParams(searchParams);
		next.set(key, value);
		next.delete('page');
		setSearchParams(next);
	};

	return (
		<div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by content type">
				{TYPE_OPTIONS.map((option) => {
					const isActive = activeType === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => updateParam('type', option.value)}
							className={cn(
								'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
								isActive
									? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
									: 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>

			<div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by upload date">
				{DATE_OPTIONS.map((option) => {
					const isActive = activeDate === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => updateParam('date', option.value)}
							className={cn(
								'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
								isActive
									? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
									: 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
