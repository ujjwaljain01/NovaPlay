// src/components/navigation/sidebar/SidebarItem.tsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCallback, useState, memo } from 'react';
import { useSidebarCollapsed } from '@/store/sidebar.selector';
import type { NavigationItem } from '@/types/navigation.types';
import {
	sidebarItemVariants,
	sidebarLabelVariants,
	sidebarSpring,
} from './animations';

interface SidebarItemProps {
	item: NavigationItem;
}

interface RippleEffect {
	id: number;
	x: number;
	y: number;
}

// IDs of items that remain visible when sidebar is collapsed
const PRIMARY_ITEM_IDS = ['home', 'tweets', 'subscriptions', 'you'];

export const SidebarItem = memo(function SidebarItem({
	item,
}: SidebarItemProps) {
	const collapsed = useSidebarCollapsed();
	const reduceMotion = useReducedMotion();
	const Icon = item.icon;
	const isPrimary = PRIMARY_ITEM_IDS.includes(item.id);

	const [ripples, setRipples] = useState<RippleEffect[]>([]);

	const handleRipple = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (reduceMotion) return;

			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const id = Date.now();

			setRipples((prev) => [...prev, { id, x, y }]);

			setTimeout(() => {
				setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
			}, 500);
		},
		[reduceMotion],
	);

	return (
		<NavLink to={item.href} end={item.end} className="block">
			{({ isActive }) => (
				<motion.div
					layout
					initial={false}
					variants={sidebarItemVariants}
					whileHover={reduceMotion ? {} : { y: -1, scale: 1.015 }}
					whileTap={reduceMotion ? {} : { scale: 0.97 }}
					transition={sidebarSpring}
					onClick={handleRipple}
					className={cn(
						'group relative mx-3 my-1 overflow-hidden rounded-xl transition-colors duration-200',
						isActive ? '' : 'hover:bg-accent/60',
						item.disabled && 'pointer-events-none opacity-50',
						collapsed && !isPrimary ? 'hidden' : '', // hide non‑primary when collapsed
						collapsed && isPrimary
							? 'flex flex-col items-center justify-center w-full px-3 py-2'
							: 'w-auto',
					)}
				>
					{/* Ripple Effect */}
					<AnimatePresence>
						{!reduceMotion &&
							ripples.map((ripple) => (
								<motion.span
									key={ripple.id}
									initial={{ scale: 0, opacity: 0.35 }}
									animate={{ scale: 3, opacity: 0 }}
									transition={{ duration: 0.5 }}
									className="pointer-events-none absolute rounded-full bg-primary"
									style={{
										left: ripple.x,
										top: ripple.y,
										width: 40,
										height: 40,
										transform: 'translate(-50%, -50%)',
									}}
								/>
							))}
					</AnimatePresence>

					{/* Active Pill */}
					<AnimatePresence initial={false}>
						{isActive && (
							<motion.div
								layoutId="sidebar-active-pill"
								className="absolute inset-0 -z-10 rounded-xl bg-primary shadow-sm"
								transition={{
									type: 'spring',
									stiffness: 380,
									damping: 34,
								}}
							/>
						)}
					</AnimatePresence>

					<motion.div
						layout
						className={cn(
							'flex',
							collapsed && isPrimary
								? 'flex-col items-center gap-1'
								: 'items-center gap-3',
						)}
					>
						{/* Icon */}
						<Icon
							size={26}
							weight={isActive ? 'fill' : 'duotone'}
							className={cn(
								'relative z-10 shrink-0 transition-colors',
								isActive
									? 'text-primary-foreground'
									: 'text-muted-foreground group-hover:text-foreground',
							)}
						/>

						{/* Label – shown either to the right or below the icon */}
						<AnimatePresence initial={false}>
							{(!collapsed || isPrimary) && (
								<motion.span
									layout
									variants={sidebarLabelVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
									className={cn(
										'relative z-10 truncate text-sm font-medium tracking-tight',
										isActive
											? 'text-primary-foreground'
											: 'text-foreground',
										collapsed && isPrimary && 'text-[10px]',
									)}
								>
									{item.label}
								</motion.span>
							)}
						</AnimatePresence>
					</motion.div>

					{/* Badge – only when not collapsed */}
					<AnimatePresence initial={false}>
						{!collapsed && item.badge && (
							<motion.div
								layout
								initial={{ scale: 0.75, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.75, opacity: 0 }}
								transition={{ duration: 0.18 }}
								className={cn(
									'relative z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold',
									isActive
										? 'bg-primary-foreground/20 text-primary-foreground'
										: 'bg-muted text-muted-foreground',
								)}
							>
								{item.badge}
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			)}
		</NavLink>
	);
});
