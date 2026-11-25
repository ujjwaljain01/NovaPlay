export const ROUTES = {
	HOME: '/',

	WATCH: '/watch/:videoId',

	TWEET_WATCH: '/tweets/:tweetId',

	LOGIN: '/login',

	REGISTER: '/register',

	CHANNEL: '/channel/:username',

	HISTORY: '/history',

	PLAYLISTS: '/playlists',

	PLAYLIST_DETAIL: '/playlists/:playlistId',

	LIKED: '/liked',

	SUBSCRIPTIONS: '/subscriptions',

	PROFILE: '/profile',

	SETTINGS: '/settings',

	DASHBOARD: '/dashboard',

	SEARCH: '/search',
    
	NOT_FOUND: '*',
} as const;
