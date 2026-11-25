import {
	HouseIcon,
	FeatherIcon,
	SubtitlesIcon,
	UserIcon,
	ClockCounterClockwiseIcon,
	PlaylistIcon,
	VideoIcon,
	ThumbsUpIcon,
	FireIcon,
	MusicNotesIcon,
	GameControllerIcon,
	NewspaperIcon,
	TrophyIcon,
	GearIcon,
	QuestionIcon,
	FlagIcon,
	PlayIcon,
	ClockIcon,
} from '@phosphor-icons/react';

import type { NavigationItem, NavigationSection } from '@/types/navigation.types';

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
	{
		id: 'home',
		label: 'Home',
		href: '/',
		icon: HouseIcon,
		end: true,
	},
	{
		id: 'videos',
		label: 'Videos',
		href: '/videos',
		icon: PlayIcon,
	},
	{
		id: 'tweets',
		label: 'Tweets',
		href: '/tweets',
		icon: FeatherIcon,
	},
	{
		id: 'subscriptions',
		label: 'Subscriptions',
		href: '/subscriptions',
		icon: SubtitlesIcon,
	},
];

export const EXPLORE_NAV_SECTION: NavigationSection = {
	id: 'explore',
	title: 'Explore',
	items: [
		{
			id: 'trending',
			label: 'Trending',
			href: '/explore/trending',
			icon: FireIcon,
		},
		{
			id: 'gaming',
			label: 'Gaming',
			href: '/explore/gaming',
			icon: GameControllerIcon,
		},
		{
			id: 'sports',
			label: 'Sports',
			href: '/explore/sports',
			icon: TrophyIcon,
		},
		{
			id: 'music',
			label: 'Music',
			href: '/explore/music',
			icon: MusicNotesIcon,
		},
		{
			id: 'news',
			label: 'News',
			href: '/explore/news',
			icon: NewspaperIcon,
		},
	],
};

export function buildNavigationSections({
	isAuthenticated,
	username,
}: {
	isAuthenticated: boolean;
	username?: string;
}): NavigationSection[] {
	const youItems: NavigationItem[] = isAuthenticated
		? [
				{
					id: 'channel',
					label: 'Your Channel',
					href: username ? `/channel/${username}` : '/profile',
					icon: UserIcon,
				},
				{
					id: 'history',
					label: 'Watch History',
					href: '/history',
					icon: ClockCounterClockwiseIcon,
				},
				{
					id: 'playlists',
					label: 'Playlists',
					href: '/playlists',
					icon: PlaylistIcon,
				},
				{
					id: 'yourVideos',
					label: 'Your Videos',
					href: '/studio/videos',
					icon: VideoIcon,
				},
				{
					id: 'watchLater',
					label: 'Watch Later',
					href: '/playlists/watch-later',
					icon: ClockIcon,
				},
				{
					id: 'likedVideos',
					label: 'Liked Videos',
					href: '/liked',
					icon: ThumbsUpIcon,
				},
			]
		: [
				{
					id: 'you',
					label: 'Sign in',
					href: '/login',
					icon: UserIcon,
					isSignIn: true,
				},
			];

	return [
		{
			id: 'main',
			items: PRIMARY_NAV_ITEMS,
		},
		{
			id: 'you',
			title: 'You',
			items: youItems,
		},
		EXPLORE_NAV_SECTION,
	];
}

export const footerNavigation: NavigationSection = {
	id: 'footer',
	items: [
		{
			id: 'settings',
			label: 'Settings',
			href: '/settings',
			icon: GearIcon,
		},
		{
			id: 'help',
			label: 'Help',
			href: '/help',
			icon: QuestionIcon,
		},
		{
			id: 'feedback',
			label: 'Send Feedback',
			action: 'feedback',
			icon: FlagIcon,
		},
	],
};
