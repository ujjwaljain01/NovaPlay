// src/data/navigation.ts
import {
	HouseIcon,
	FeatherIcon,
	SubtitlesIcon,
	UserIcon,
	ClockCounterClockwiseIcon,
	PlaylistIcon,
	VideoIcon,
	ClockIcon,
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
} from '@phosphor-icons/react';

import type { NavigationSection } from '@/types/navigation.types';

export const guestNavigation: NavigationSection[] = [
	{
		id: 'main',
		items: [
			{
				id: 'home',
				label: 'Home',
				href: '/',
				icon: HouseIcon,
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
		],
	},
	{
		id: 'you',
		title: 'You',
		items: [
			{
				id: 'you',
				label: 'Sign in',
				href: '/signin',
				icon: UserIcon,
				isSignIn: true, // custom flag for identification
			},
		],
	},
	{
		id: 'explore',
		title: 'Explore',
		items: [
			// ... same as before
			{
				id: 'trending',
				label: 'Trending',
				href: '/trending',
				icon: FireIcon,
			},
			{
				id: 'music',
				label: 'Music',
				href: '/music',
				icon: MusicNotesIcon,
			},
			{
				id: 'gaming',
				label: 'Gaming',
				href: '/gaming',
				icon: GameControllerIcon,
			},
			{
				id: 'news',
				label: 'News',
				href: '/news',
				icon: NewspaperIcon,
			},
			{
				id: 'sports',
				label: 'Sports',
				href: '/sports',
				icon: TrophyIcon,
			},
		],
	},
];

export const authenticatedNavigation: NavigationSection[] = [
	// ... unchanged
	{
		id: 'main',
		items: [
			{
				id: 'home',
				label: 'Home',
				href: '/',
				icon: HouseIcon,
			},
			{
				id: 'tweets',
				label: 'Tweets',
				href: '/tweets',
				icon: FeatherIcon,
			},
			{
				id: 'videos',
				label: 'Videos',
				href: '/videos',
				icon: PlayIcon,
			},
			{
				id: 'subscriptions',
				label: 'Subscriptions',
				href: '/subscriptions',
				icon: SubtitlesIcon,
			},
		],
	},
	{
		id: 'you',
		title: 'You',
		items: [
			{
				id: 'channel',
				label: 'Your Channel',
				href: '/channel',
				icon: UserIcon,
			},
			{
				id: 'history',
				label: 'History',
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
				id: 'videos',
				label: 'Your Videos',
				href: '/studio/videos',
				icon: VideoIcon,
			},
			{
				id: 'watchLater',
				label: 'Watch Later',
				href: '/watch-later',
				icon: ClockIcon,
			},
			{
				id: 'likedVideos',
				label: 'Liked Videos',
				href: '/liked',
				icon: ThumbsUpIcon,
			},
		],
	},
	{
		id: 'explore',
		title: 'Explore',
		items: [
			// ... same as guest
			{
				id: 'trending',
				label: 'Trending',
				href: '/trending',
				icon: FireIcon,
			},
			{
				id: 'music',
				label: 'Music',
				href: '/music',
				icon: MusicNotesIcon,
			},
			{
				id: 'gaming',
				label: 'Gaming',
				href: '/gaming',
				icon: GameControllerIcon,
			},
			{
				id: 'news',
				label: 'News',
				href: '/news',
				icon: NewspaperIcon,
			},
			{
				id: 'sports',
				label: 'Sports',
				href: '/sports',
				icon: TrophyIcon,
			},
		],
	},
];

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
			href: '/feedback',
			icon: FlagIcon,
		},
	],
};
