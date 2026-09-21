// src/components/navigation/sidebar/SidebarGroup.tsx
import { AnimatePresence, motion } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { useSidebarCollapsed } from '@/store/sidebar.selector';
import { useAuthStore } from '@/features/auth/auth.store';
import type { NavigationSection } from '@/types/navigation.types';
import { SidebarItem } from './SidebarItem';
import { SidebarSignInPrompt } from './SidebarSignInPrompt';

interface SidebarGroupProps {
	section: NavigationSection;
}

export function SidebarGroup({ section }: SidebarGroupProps) {
	const collapsed = useSidebarCollapsed();
	const { isAuthenticated } = useAuthStore();

	// Special handling for the "You" section when unauthenticated and expanded
	if (section.id === 'you' && !isAuthenticated) {
		return (
			<motion.section layout initial={false} className="py-2">
				<AnimatePresence initial={false}>
					{!collapsed && section.title && (
						<motion.div
							layout
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.2 }}
							className="mb-2 px-5"
						>
							<h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
								{section.title}
							</h2>
						</motion.div>
					)}
				</AnimatePresence>

				{!collapsed && <SidebarSignInPrompt />}
			</motion.section>
		);
	}

	// Regular rendering for other sections or authenticated "You"
	return (
		<motion.section layout initial={false} className="py-2">
			<AnimatePresence initial={false}>
				{!collapsed && section.title && (
					<motion.div
						layout
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.2 }}
						className="mb-2 px-5"
					>
						<h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							{section.title}
						</h2>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.div
				layout
				className="space-y-1"
				initial="hidden"
				animate="visible"
				variants={{
					hidden: {},
					visible: {
						transition: {
							staggerChildren: 0.03,
						},
					},
				}}
			>
				{section.items.map((item) => (
					<motion.div
						key={item.id}
						layout
						variants={{
							hidden: { opacity: 0, x: -8 },
							visible: { opacity: 1, x: 0 },
						}}
						transition={{ duration: 0.18 }}
					>
						<SidebarItem item={item} />
					</motion.div>
				))}
			</motion.div>

			<div className="mt-3 px-3">
				<Separator />
			</div>
		</motion.section>
	);
}
