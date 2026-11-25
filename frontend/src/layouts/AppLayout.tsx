import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/navbar';
import { Sidebar } from '@/components/navigation/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FeedbackModal } from '@/features/feedback';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSidebarShortcut } from '@/hooks/useSidebarShortcut';
import { useSidebarCollapsed } from '@/store/sidebar.selector';

export default function AppLayout() {
	useSidebarShortcut();
	const isMobile = useIsMobile();
	const collapsed = useSidebarCollapsed();

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<TooltipProvider>
				<Navbar />
				<div className="flex min-w-0 flex-1">
					<Sidebar />

					<main
						data-sidebar-state={
							isMobile
								? 'drawer'
								: collapsed
									? 'collapsed'
									: 'expanded'
						}
						className="min-w-0 flex-1 overflow-x-hidden"
					>
						<Outlet />
					</main>
				</div>
				<FeedbackModal />
			</TooltipProvider>
		</div>
	);
}
