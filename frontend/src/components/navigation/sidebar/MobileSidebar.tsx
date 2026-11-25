import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
	useCloseSidebar,
	useSidebarMobileOpen,
} from '@/store/sidebar.selector';
import { useNavigation } from '@/hooks/use-navigation';
import { SidebarGroup } from './SidebarGroup';
import { SidebarFooter } from './SidebarFooter';

export function MobileSidebar() {
	const open = useSidebarMobileOpen();
	const close = useCloseSidebar();
	const navigation = useNavigation();
	const location = useLocation();

	useEffect(() => {
		close();
	}, [location.pathname, location.search, close]);

	return (
		<Sheet
			open={open}
			onOpenChange={(value) => {
				if (!value) close();
			}}
		>
			<SheetContent
				side="left"
				className="w-[260px] border-r bg-background p-0"
			>
				<div className="flex h-full flex-col">
					<div className="flex-1 overflow-y-auto py-3 scrollbar">
						{navigation.map((section) => (
							<SidebarGroup
								key={section.id}
								section={section}
								collapsedOverride={false}
								showSubscribedChannels={false}
							/>
						))}
						<SidebarFooter collapsedOverride={false} />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
