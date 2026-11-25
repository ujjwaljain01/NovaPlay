import { footerNavigation } from '@/data/navigation';
import { useFeedbackModalStore } from '@/store/feedback-modal.store';
import { useCloseSidebar } from '@/store/sidebar.selector';
import type { NavigationAction } from '@/types/navigation.types';
import { SidebarItem } from './SidebarItem';

interface SidebarFooterProps {
	collapsedOverride?: boolean;
}

export function SidebarFooter({ collapsedOverride }: SidebarFooterProps) {
	const openFeedbackModal = useFeedbackModalStore((s) => s.open);
	const closeMobileSidebar = useCloseSidebar();

	const handleAction = (action: NavigationAction) => {
		if (action === 'feedback') {
			closeMobileSidebar();
			openFeedbackModal();
		}
	};

	return (
		<footer className="py-2">
			{footerNavigation.items.map((item) => (
				<SidebarItem
					key={item.id}
					item={item}
					collapsedOverride={collapsedOverride}
					onAction={handleAction}
				/>
			))}
		</footer>
	);
}
