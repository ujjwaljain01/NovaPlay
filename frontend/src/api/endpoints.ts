export const API = {
	auth: {
		login: '/users/login',
		logout: '/users/logout',
		register: '/users/register',
		currentUser: '/users/current-user',
		refresh: '/users/refresh-token',
	},

	users: {
		getUploadUrl: '/users/get-upload-url',
	},

	videos: {
		all: '/videos',
		byId: (id: string) => `/videos/${id}`,
		incrementViews: (id: string) => `/videos/${id}/increment-views`,
		togglePublish: (id: string) => `/videos/${id}/toggle-publish`,
		search: '/videos/search',
	},

	tweets: {
		all: '/tweets',
		byId: (id: string) => `/tweets/${id}`,
	},

	comments: {
		base: '/comments',
		byId: (id: string) => `/comments/${id}`,
		forTarget: (targetId: string) => `/comments/${targetId}`,
		replies: (commentId: string) => `/comments/${commentId}/replies`,
	},

	channel: {
		profile: (username: string) => `/users/c/${username}`,
		videos: (username: string) => `/users/c/${username}/videos`,
	},

	history: {
		list: '/users/history',
		write: '/users/history',
	},

	playlist: {
		create: '/playlist',
		list: (userId: string) => `/playlist/user/${userId}`,
		detail: (playlistId: string) => `/playlist/${playlistId}`,
		update: (playlistId: string) => `/playlist/${playlistId}`,
		delete: (playlistId: string) => `/playlist/${playlistId}`,
		addVideo: (videoId: string, playlistId: string) =>
			`/playlist/add/${videoId}/${playlistId}`,
		removeVideo: (videoId: string, playlistId: string) =>
			`/playlist/remove/${videoId}/${playlistId}`,
	},

	liked: {
		list: '/likes/videos',
	},

	likes: {
		toggleVideo: (videoId: string) => `/likes/toggle/v/${videoId}`,
	},

	subscriptions: {
		list: (channelId: string) => `/subscriptions/c/${channelId}`,
		toggle: (channelId: string) => `/subscriptions/c/${channelId}`,
	},

	search: {
		query: '/search',
	},

	dashboard: {
		stats: '/dashboard/stats',
		videos: '/dashboard/videos',
	},
};
