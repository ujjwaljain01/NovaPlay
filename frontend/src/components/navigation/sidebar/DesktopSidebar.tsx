import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/constants/layout';
import { useNavigation } from '@/hooks/use-navigation';
import { useSidebarCollapsed } from '@/store/sidebar.selector';
import { SidebarFooter } from './SidebarFooter';
import { SidebarGroup } from './SidebarGroup';

const PRIMARY_ITEM_IDS = ['home', 'videos', 'tweets', 'subscriptions'];

export function DesktopSidebar() {
	const collapsed = useSidebarCollapsed();
	const navigation = useNavigation();
	const reduceMotion = useReducedMotion();

	const visibleSections = useMemo(() => {
		if (!collapsed) return navigation;

		const primaryItems = navigation
			.flatMap((section) => section.items)
			.filter((item) => PRIMARY_ITEM_IDS.includes(item.id));

		return [
			{
				id: 'main',
				items: primaryItems,
			},
		];
	}, [navigation, collapsed]);

	return (
		<motion.aside
			initial={false}
			animate={{
				width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
			}}
			transition={
				reduceMotion
					? { duration: 0 }
					: {
							duration: 0.22,
							ease: [0.22, 1, 0.36, 1],
						}
			}
			className={cn(
				'sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-x-hidden border-r border-border/60 bg-background/95 backdrop-blur-xl lg:flex lg:flex-col',
			)}
		>
			<div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar">
				{visibleSections.map((section) => (
					<SidebarGroup
						key={section.id}
						section={section}
						collapsedOverride={collapsed}
						showSubscribedChannels={!collapsed}
					/>
				))}

				{!collapsed && <SidebarFooter collapsedOverride={false} />}
			</div>
		</motion.aside>
	);
}
