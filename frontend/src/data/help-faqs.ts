export type HelpFaqCategory =
	| 'uploads'
	| 'playlists'
	| 'hashtags'
	| 'shortcuts';

export interface HelpFaqShortcut {
	keys: string[];
	action: string;
}

export interface HelpFaqItem {
	id: string;
	category: HelpFaqCategory;
	categoryLabel: string;
	question: string;
	answer: string;
	keywords: string[];
	shortcuts?: HelpFaqShortcut[];
}

export const HELP_FAQ_CATEGORIES: ReadonlyArray<{
	id: HelpFaqCategory | 'all';
	label: string;
}> = [
	{ id: 'all', label: 'All Topics' },
	{ id: 'uploads', label: 'Uploads' },
	{ id: 'playlists', label: 'Playlists' },
	{ id: 'hashtags', label: 'Hashtags' },
	{ id: 'shortcuts', label: 'Keyboard Shortcuts' },
];

export const HELP_FAQS: HelpFaqItem[] = [
	{
		id: 'upload-formats-and-limits',
		category: 'uploads',
		categoryLabel: 'Uploads',
		question: 'What video formats and file sizes can I upload?',
		answer:
			'Sign in and click the Create button in the top bar to open the upload modal. NovaPlay supports MP4, WebM, MOV, and MKV video files up to 500 MB, along with JPG, PNG, or WebP thumbnails up to 5 MB.',
		keywords: ['upload', 'video', 'mp4', 'webm', 'mov', 'mkv', 'thumbnail', '500mb', 'size'],
	},
	{
		id: 'upload-visibility-and-studio',
		category: 'uploads',
		categoryLabel: 'Uploads',
		question: 'How do I publish, unpublish, or edit my uploaded videos?',
		answer:
			'During upload you can choose whether a video is published immediately or kept private. You can toggle visibility or manage your uploads anytime from Creator Studio (/studio/videos).',
		keywords: ['publish', 'private', 'draft', 'studio', 'manage', 'edit', 'upload'],
	},
	{
		id: 'playlists-create-and-manage',
		category: 'playlists',
		categoryLabel: 'Playlists',
		question: 'How do I create a playlist and add or remove videos?',
		answer:
			'Open Playlists from the sidebar (/playlists) to create a named collection, rename it, or delete it. You can open any playlist to view its videos and remove entries at any time.',
		keywords: ['playlist', 'create', 'add', 'remove', 'collection', 'library'],
	},
	{
		id: 'playlists-watch-later',
		category: 'playlists',
		categoryLabel: 'Playlists',
		question: 'How does Watch Later work?',
		answer:
			'Watch Later (/playlists/watch-later) is your dedicated personal queue under the You section in the sidebar. Use it to bookmark videos you want to revisit later without mixing them into public playlists.',
		keywords: ['watch later', 'playlist', 'bookmark', 'queue', 'save'],
	},
	{
		id: 'hashtags-how-they-work',
		category: 'hashtags',
		categoryLabel: 'Hashtags',
		question: 'How do hashtags work in videos and tweets?',
		answer:
			'Include #tags anywhere in a video title, video description, or tweet (for example #gaming, #music, #sports, or #news). NovaPlay automatically extracts and normalizes hashtags so anyone can click a tag to view matching videos and tweets.',
		keywords: ['hashtag', 'tag', '#', 'tweet', 'description', 'title', 'discover'],
	},
	{
		id: 'hashtags-explore-and-search',
		category: 'hashtags',
		categoryLabel: 'Hashtags',
		question: 'Where do clickable hashtags navigate and how do Explore feeds use them?',
		answer:
			'Clicking any #hashtag opens /search?tag=<tag> showing all matching videos and tweets. The Explore categories in the sidebar (Trending, Gaming, Sports, Music, and News) also surface content tagged with matching topic hashtags.',
		keywords: ['hashtag', 'explore', 'trending', 'search', 'gaming', 'music', 'sports', 'news'],
	},
	{
		id: 'shortcuts-navigation',
		category: 'shortcuts',
		categoryLabel: 'Keyboard Shortcuts',
		question: 'What keyboard shortcuts are available for navigation?',
		answer:
			'Use the sidebar shortcut anywhere in the desktop app to collapse or expand the navigation rail without reaching for the menu button.',
		keywords: ['shortcut', 'keyboard', 'sidebar', 'ctrl', 'cmd', 'b', 'collapse'],
		shortcuts: [
			{
				keys: ['Ctrl / Cmd', 'B'],
				action: 'Toggle desktop sidebar collapsed / expanded',
			},
		],
	},
	{
		id: 'shortcuts-video-player',
		category: 'shortcuts',
		categoryLabel: 'Keyboard Shortcuts',
		question: 'What keyboard shortcuts work in the video player?',
		answer:
			'When the video player on a watch page has focus, standard playback shortcuts are supported for quick control.',
		keywords: ['shortcut', 'keyboard', 'player', 'play', 'pause', 'mute', 'fullscreen', 'seek', 'volume'],
		shortcuts: [
			{ keys: ['Space / K'], action: 'Play or pause video' },
			{ keys: ['M'], action: 'Mute or unmute audio' },
			{ keys: ['F'], action: 'Toggle fullscreen mode' },
			{ keys: ['← / →'], action: 'Seek backward or forward' },
			{ keys: ['↑ / ↓'], action: 'Adjust playback volume' },
		],
	},
];
