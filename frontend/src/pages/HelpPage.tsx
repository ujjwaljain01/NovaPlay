import { useMemo, useState } from 'react';
import {
	FlagIcon,
	MagnifyingGlassIcon,
	QuestionIcon,
	XIcon,
} from '@phosphor-icons/react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	HELP_FAQ_CATEGORIES,
	HELP_FAQS,
	type HelpFaqCategory,
} from '@/data/help-faqs';
import { FaqAccordion } from '@/features/help/components/FaqAccordion';
import { cn } from '@/lib/utils';
import { useFeedbackModalStore } from '@/store/feedback-modal.store';

export default function HelpPage() {
	const [query, setQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState<HelpFaqCategory | 'all'>(
		'all',
	);
	const [openIds, setOpenIds] = useState<Set<string>>(
		() => new Set([HELP_FAQS[0]?.id ?? '']),
	);
	const openFeedbackModal = useFeedbackModalStore((s) => s.open);

	const filteredFaqs = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return HELP_FAQS.filter((faq) => {
			if (activeCategory !== 'all' && faq.category !== activeCategory) {
				return false;
			}
			if (!normalizedQuery) return true;

			const searchableText = [
				faq.question,
				faq.answer,
				faq.categoryLabel,
				...faq.keywords,
				...(faq.shortcuts?.flatMap((s) => [...s.keys, s.action]) ?? []),
			]
				.join(' ')
				.toLowerCase();

			return searchableText.includes(normalizedQuery);
		});
	}, [query, activeCategory]);

	const handleToggle = (id: string) => {
		setOpenIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleClearFilters = () => {
		setQuery('');
		setActiveCategory('all');
	};

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-3xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<div className="flex items-center gap-2.5">
						<QuestionIcon
							size={26}
							weight="duotone"
							className="text-primary"
						/>
						<h1 className="text-2xl font-bold text-foreground">Help & FAQ</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						Search answers for video uploads, playlists, hashtags, and keyboard
						shortcuts.
					</p>
				</header>

				{/* Search & Category Filter */}
				<div className="space-y-3">
					<div className="relative">
						<MagnifyingGlassIcon
							size={18}
							className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search help topics (e.g., upload, playlist, hashtag, shortcut)..."
							aria-label="Search FAQ"
							className="h-11 rounded-xl bg-card pr-10 pl-10"
						/>
						{query.length > 0 && (
							<button
								type="button"
								onClick={() => setQuery('')}
								aria-label="Clear search"
								className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								<XIcon size={16} />
							</button>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						{HELP_FAQ_CATEGORIES.map((cat) => {
							const isActive = activeCategory === cat.id;
							return (
								<button
									key={cat.id}
									type="button"
									onClick={() => setActiveCategory(cat.id)}
									className={cn(
										'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
										isActive
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
									)}
								>
									{cat.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* FAQ Results */}
				{filteredFaqs.length === 0 ? (
					<EmptyState
						icon={<QuestionIcon size={40} weight="duotone" />}
						title="No matching help topics"
						description="Try a different keyword or reset your filters to view all FAQs."
						action={
							<Button
								type="button"
								variant="outline"
								onClick={handleClearFilters}
								className="rounded-full"
							>
								Clear search
							</Button>
						}
					/>
				) : (
					<FaqAccordion
						items={filteredFaqs}
						openIds={openIds}
						onToggle={handleToggle}
					/>
				)}

				{/* Feedback CTA */}
				<section className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
					<div className="space-y-0.5">
						<h2 className="text-sm font-semibold text-foreground">
							Still have questions or spotted an issue?
						</h2>
						<p className="text-xs text-muted-foreground">
							Send us feedback directly and include the page you are viewing.
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={openFeedbackModal}
						className="rounded-full"
					>
						<FlagIcon size={16} weight="duotone" />
						<span>Send Feedback</span>
					</Button>
				</section>
			</div>
		</ErrorBoundary>
	);
}
