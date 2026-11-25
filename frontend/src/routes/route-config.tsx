//src/routes/route-config.tsx

import type { RouteObject } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';

import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from './route-paths';

export const routes: RouteObject[] = [
    // -----------------------
    // Public Routes
    // -----------------------
    {
        element: <AppLayout />,
        children: [
            {
                path: ROUTES.HOME,
                lazy: async () => {
                    const module = await import('@/pages/HomePage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.VIDEOS,
                lazy: async () => {
                    const module = await import('@/pages/VideosPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.TWEETS,
                lazy: async () => {
                    const module = await import('@/pages/TweetsPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.SUBSCRIPTIONS,
                lazy: async () => {
                    const module = await import('@/pages/SubscriptionsPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.WATCH,
                lazy: async () => {
                    const module = await import('@/pages/WatchPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.TWEET_WATCH,
                lazy: async () => {
                    const module = await import('@/pages/TweetWatchPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.CHANNEL,
                lazy: async () => {
                    const module = await import('@/pages/ChannelPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.SEARCH,
                lazy: async () => {
                    const module = await import('@/pages/SearchPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.EXPLORE,
                lazy: async () => {
                    const module = await import('@/pages/ExplorePage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.SETTINGS,
                lazy: async () => {
                    const module = await import('@/pages/SettingsPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.HELP,
                lazy: async () => {
                    const module = await import('@/pages/HelpPage');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.HANDLE_CHANNEL,
                lazy: async () => {
                    const module = await import('@/pages/HandleChannelPage');
                    return { Component: module.default };
                },
            },
        ],
    },

    // -----------------------
    // Protected Routes
    // -----------------------
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: ROUTES.HISTORY,
                        lazy: async () => {
                            const module = await import('@/pages/HistoryPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.PLAYLISTS,
                        lazy: async () => {
                            const module = await import('@/pages/PlaylistsPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.WATCH_LATER,
                        lazy: async () => {
                            const module = await import('@/pages/WatchLaterPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.WATCH_LATER_ALIAS,
                        lazy: async () => {
                            const module = await import('@/pages/WatchLaterPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.PLAYLIST_DETAIL,
                        lazy: async () => {
                            const module = await import('@/pages/PlaylistDetailPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.LIKED,
                        lazy: async () => {
                            const module = await import('@/pages/LikedPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.LIKED_ALIAS,
                        lazy: async () => {
                            const module = await import('@/pages/LikedPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.PROFILE,
                        lazy: async () => {
                            const module = await import('@/pages/ProfilePage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.STUDIO,
                        lazy: async () => {
                            const module = await import('@/pages/StudioPage');
                            return { Component: module.default };
                        },
                    },
                    {
                        path: ROUTES.STUDIO_VIDEOS,
                        lazy: async () => {
                            const module = await import('@/pages/StudioPage');
                            return { Component: module.default };
                        },
                    },
                ],
            },
        ],
    },

    // -----------------------
    // Guest Routes
    // -----------------------
    {
        element: <GuestRoute />,
        children: [
            {
                path: ROUTES.LOGIN,
                lazy: async () => {
                    const module = await import('@/pages/Auth/Login');
                    return { Component: module.default };
                },
            },
            {
                path: ROUTES.REGISTER,
                lazy: async () => {
                    const module = await import('@/pages/Auth/Register');
                    return { Component: module.default };
                },
            },
        ],
    },

    {
        path: ROUTES.NOT_FOUND,
        lazy: async () => {
            const module = await import('@/pages/NotFound');
            return { Component: module.default };
        },
    },
];