import type { ReactNode } from 'react';
import {
	ChatTextIcon,
	PlaylistIcon,
	VideoCameraIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type ChannelTab = 'videos' | 'tweets' | 'playlists';

interface ChannelTabsProps {
	activeTab: ChannelTab;
	onTabChange: (tab: ChannelTab) => void;
}

const TABS: Array<{ id: ChannelTab; label: string; icon: ReactNode }> = [
	{ id: 'videos', label: 'Videos', icon: <VideoCameraIcon size={16} /> },
	{ id: 'tweets', label: 'Tweets', icon: <ChatTextIcon size={16} /> },
	{ id: 'playlists', label: 'Playlists', icon: <PlaylistIcon size={16} /> },
];

export function ChannelTabs({ activeTab, onTabChange }: ChannelTabsProps) {
	return (
		<div
			role="tablist"
			aria-label="Channel sections"
			className="flex items-center gap-1 border-b border-[var(--border)] pb-2"
		>
			{TABS.map((tab) => {
				const isActive = activeTab === tab.id;
				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onTabChange(tab.id)}
						className={cn(
							'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
							isActive
								? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
								: 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
						)}
					>
						{tab.icon}
						<span>{tab.label}</span>
					</button>
				);
			})}
		</div>
	);
}
