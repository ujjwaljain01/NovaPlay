import { useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSidebarCollapsed } from '@/store/sidebar.selector';
import { useAuthStore } from '@/features/auth/auth.store';
import type { NavigationSection } from '@/types/navigation.types';
import { SidebarItem } from './SidebarItem';
import { SidebarSignInPrompt } from './SidebarSignInPrompt';
import { SidebarSubscribedChannels } from './SidebarSubscribedChannels';

interface SidebarGroupProps {
	section: NavigationSection;
	collapsedOverride?: boolean;
	showSubscribedChannels?: boolean;
	showSeparator?: boolean;
}

export function SidebarGroup({
	section,
	collapsedOverride,
	showSubscribedChannels = false,
	showSeparator = true,
}: SidebarGroupProps) {
	const storeCollapsed = useSidebarCollapsed();
	const collapsed = collapsedOverride ?? storeCollapsed;
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const reduceMotion = useReducedMotion();
	const [isExploreOpen, setIsExploreOpen] = useState(true);

	if (section.id === 'explore') {
		if (collapsed) return null;

		return (
			<section className="py-2">
				<div className="mb-1 px-2.5">
					<button
						type="button"
						aria-expanded={isExploreOpen}
						aria-controls="sidebar-explore-items"
						onClick={() => setIsExploreOpen((prev) => !prev)}
						className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-accent/60"
					>
						<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							{section.title ?? 'Explore'}
						</span>
						<CaretDownIcon
							size={14}
							className={cn(
								'text-muted-foreground transition-transform duration-150',
								!isExploreOpen && '-rotate-90',
							)}
						/>
					</button>
				</div>

				<AnimatePresence initial={false}>
					{isExploreOpen && (
						<motion.div
							id="sidebar-explore-items"
							initial={
								reduceMotion
									? false
									: { height: 0, opacity: 0 }
							}
							animate={{ height: 'auto', opacity: 1 }}
							exit={
								reduceMotion
									? { opacity: 0 }
									: { height: 0, opacity: 0 }
							}
							transition={
								reduceMotion
									? { duration: 0 }
									: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
							}
							className="space-y-0.5 overflow-hidden"
						>
							{section.items.map((item) => (
								<SidebarItem
									key={item.id}
									item={item}
									collapsedOverride={collapsed}
								/>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{showSeparator && (
					<div className="mt-3 px-3">
						<Separator />
					</div>
				)}
			</section>
		);
	}

	if (section.id === 'you' && !isAuthenticated) {
		if (collapsed) return null;

		return (
			<section className="py-2">
				{section.title && (
					<div className="mb-2 px-5">
						<h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							{section.title}
						</h2>
					</div>
				)}
				<SidebarSignInPrompt
					variant="sidebar"
					description="Sign in to view your channel, playlists, history, and Watch Later"
				/>
				{showSeparator && (
					<div className="mt-3 px-3">
						<Separator />
					</div>
				)}
			</section>
		);
	}

	return (
		<section className="py-2">
			{!collapsed && section.title && (
				<div className="mb-1.5 px-5">
					<h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
						{section.title}
					</h2>
				</div>
			)}

			<div className="space-y-0.5">
				{section.items.map((item) => (
					<SidebarItem
						key={item.id}
						item={item}
						collapsedOverride={collapsed}
					/>
				))}
			</div>

			{section.id === 'main' && !collapsed && showSubscribedChannels && (
				<SidebarSubscribedChannels enabled />
			)}

			{!collapsed && showSeparator && (
				<div className="mt-3 px-3">
					<Separator />
				</div>
			)}
		</section>
	);
}
