import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebarCollapsed } from '@/store/sidebar.selector';
import type { NavigationAction, NavigationItem } from '@/types/navigation.types';

interface SidebarItemProps {
	item: NavigationItem;
	collapsedOverride?: boolean;
	onAction?: (action: NavigationAction) => void;
}

const PRIMARY_ITEM_IDS = ['home', 'videos', 'tweets', 'subscriptions'];

export const SidebarItem = memo(function SidebarItem({
	item,
	collapsedOverride,
	onAction,
}: SidebarItemProps) {
	const storeCollapsed = useSidebarCollapsed();
	const collapsed = collapsedOverride ?? storeCollapsed;
	const Icon = item.icon;
	const isPrimary = PRIMARY_ITEM_IDS.includes(item.id);

	if (collapsed && !isPrimary) {
		return null;
	}

	const renderContent = (isActive: boolean) => (
		<div
			className={cn(
				'group relative rounded-xl transition-colors duration-150',
				isActive
					? 'bg-primary text-primary-foreground shadow-sm'
					: 'text-foreground hover:bg-accent/60',
				item.disabled && 'pointer-events-none opacity-50',
				collapsed
					? 'mx-1.5 my-1 flex flex-col items-center justify-center gap-1 px-1 py-2.5'
					: 'mx-2.5 my-0.5 flex items-center justify-between gap-3 px-3 py-2',
			)}
		>
			<div
				className={cn(
					'flex min-w-0 items-center',
					collapsed ? 'flex-col gap-1' : 'gap-3',
				)}
			>
				<Icon
					size={collapsed ? 22 : 20}
					weight={isActive ? 'fill' : 'duotone'}
					className={cn(
						'shrink-0 transition-colors',
						isActive
							? 'text-primary-foreground'
							: 'text-muted-foreground group-hover:text-foreground',
					)}
				/>

				<span
					className={cn(
						'truncate font-medium tracking-tight',
						isActive ? 'text-primary-foreground' : 'text-foreground',
						collapsed
							? 'max-w-[60px] text-center text-[10px] leading-tight'
							: 'text-sm',
					)}
				>
					{item.label}
				</span>
			</div>

			{!collapsed && item.badge && (
				<span
					className={cn(
						'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
						isActive
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-muted-foreground',
					)}
				>
					{item.badge}
				</span>
			)}
		</div>
	);

	if (item.action || !item.href) {
		return (
			<button
				type="button"
				disabled={item.disabled}
				onClick={() => {
					if (item.action) {
						onAction?.(item.action);
					}
				}}
				className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
			>
				{renderContent(false)}
			</button>
		);
	}

	return (
		<NavLink to={item.href} end={item.end} className="block">
			{({ isActive }) => renderContent(isActive)}
		</NavLink>
	);
});
