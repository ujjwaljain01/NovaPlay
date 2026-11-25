export const ROUTES = {
	HOME: '/',

	VIDEOS: '/videos',

	TWEETS: '/tweets',

	WATCH: '/watch/:videoId',

	TWEET_WATCH: '/tweets/:tweetId',

	LOGIN: '/login',

	REGISTER: '/register',

	CHANNEL: '/channel/:username',

	HISTORY: '/history',

	PLAYLISTS: '/playlists',

	PLAYLIST_DETAIL: '/playlists/:playlistId',

	WATCH_LATER: '/playlists/watch-later',

	WATCH_LATER_ALIAS: '/playlist/watch-later',

	LIKED: '/liked',

	LIKED_ALIAS: '/playlist/liked',

	SUBSCRIPTIONS: '/subscriptions',

	EXPLORE: '/explore/:category',

	PROFILE: '/profile',

	SETTINGS: '/settings',

	HELP: '/help',

	STUDIO: '/studio',

	STUDIO_VIDEOS: '/studio/videos',

	SEARCH: '/search',

	HANDLE_CHANNEL: '/:handle',

	NOT_FOUND: '*',
} as const;
