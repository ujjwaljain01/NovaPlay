import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { feedFilters } from '@/data/feed-filters';
import { useFeedFilterStore } from '@/store/feed-filter.store';
import { FeedFilterChip } from './FeedFilterChip';

export function FeedFilters() {
	const selected = useFeedFilterStore((state) => state.selected);
	const setSelected = useFeedFilterStore((state) => state.setSelected);

	return (
		<div className="sticky top-0 z-20 bg-background py-2">
			<ScrollArea className="w-full whitespace-nowrap">
				{/* ADDED: gap-3 for spacing between chips and pb-2 to prevent scrollbar overlap */}
				<div className="flex gap-3 pr-2 pb-2">
					{feedFilters.map((filter) => (
						<FeedFilterChip
							key={filter.id}
							label={filter.label}
							selected={selected === filter.id}
							onSelect={() => setSelected(filter.id)}
						/>
					))}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}
