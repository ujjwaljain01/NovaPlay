import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	ChatTextIcon,
	PlaylistIcon,
	UserCircleIcon,
	VideoCameraIcon,
} from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/auth.store';
import { ChannelHeader } from '@/features/channel/components/ChannelHeader';
import {
	ChannelTabs,
	type ChannelTab,
} from '@/features/channel/components/ChannelTabs';
import { ChannelVideoCard } from '@/features/channel/components/ChannelVideoCard';
import { useChannelProfile } from '@/features/channel/hooks/useChannelProfile';
import { useChannelVideos } from '@/features/channel/hooks/useChannelVideos';
import { PlaylistCard } from '@/features/playlist/components/PlaylistCard';
import { usePlaylists } from '@/features/playlist/hooks/usePlaylists';
import { useToggleSubscription } from '@/features/subscriptions/hooks/useToggleSubscription';
import { TweetCard } from '@/features/tweets/components/TweetCard';
import { TweetCardSkeleton } from '@/features/tweets/components/TweetCardSkeleton';
import { useUserTweets } from '@/features/tweets/hooks/useUserTweets';
import { VideoCardSkeleton } from '@/features/videos/components/VideoCardSkeleton';
import { ROUTES } from '@/routes/route-paths';

export default function ChannelPage() {
	const { username: routeUsername, handle } = useParams<{
		username?: string;
		handle?: string;
	}>();
	const username =
		routeUsername ?? (handle?.startsWith('@') ? handle.slice(1) : '');
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [activeTab, setActiveTab] = useState<ChannelTab>('videos');

	const {
		data: profile,
		isLoading: profileLoading,
		isError: profileError,
	} = useChannelProfile(username);

	const toggleSubscriptionMutation = useToggleSubscription();

	const handleToggleSubscribe = () => {
		if (!isAuthenticated) {
			navigate(ROUTES.LOGIN);
			return;
		}
		if (!profile) return;
		toggleSubscriptionMutation.mutate({
			channelId: profile._id,
			username: profile.username,
		});
	};

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				{profileLoading ? (
					<ChannelPageSkeleton />
				) : profileError || !profile ? (
					<EmptyState
						icon={<UserCircleIcon size={44} />}
						title="Channel not found"
						description="The channel you are looking for does not exist or could not be loaded."
					/>
				) : (
					<>
						<ChannelHeader
							fullName={profile.fullName}
							username={profile.username}
							avatar={profile.avatar}
							coverImage={profile.coverImage}
							subscribersCount={profile.subscribersCount}
							subscribedToCount={profile.ChannelsSubscriberToCount}
							isSubscribed={profile.isSubscribed}
							isOwnChannel={user?._id === profile._id}
							isSubscribing={toggleSubscriptionMutation.isPending}
							onToggleSubscribe={handleToggleSubscribe}
						/>

						<ChannelTabs
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>

						{activeTab === 'videos' ? (
							<ChannelVideosPanel username={profile.username} />
						) : activeTab === 'tweets' ? (
							<ChannelTweetsPanel userId={profile._id} />
						) : (
							<ChannelPlaylistsPanel userId={profile._id} />
						)}
					</>
				)}
			</div>
		</ErrorBoundary>
	);
}

function ChannelVideosPanel({ username }: { username: string }) {
	const { data, isLoading, isError } = useChannelVideos(username);
	const videos = data?.docs ?? [];

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<VideoCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				icon={<VideoCameraIcon size={40} />}
				title="Unable to load videos"
				description="Please try again in a moment."
			/>
		);
	}

	if (videos.length === 0) {
		return (
			<EmptyState
				icon={<VideoCameraIcon size={40} />}
				title="No videos uploaded"
				description="This channel hasn't published any videos yet."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{videos.map((video) => (
				<ChannelVideoCard key={video._id} video={video} />
			))}
		</div>
	);
}

function ChannelTweetsPanel({ userId }: { userId: string }) {
	const { data: tweets = [], isLoading, isError } = useUserTweets(userId, true);

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<TweetCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				icon={<ChatTextIcon size={40} />}
				title="Unable to load tweets"
				description="Sign in to view channel tweets or try again later."
			/>
		);
	}

	if (tweets.length === 0) {
		return (
			<EmptyState
				icon={<ChatTextIcon size={40} />}
				title="No tweets yet"
				description="This channel hasn't posted any tweets."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{tweets.map((tweet) => (
				<TweetCard key={tweet._id} tweet={tweet} />
			))}
		</div>
	);
}

function ChannelPlaylistsPanel({ userId }: { userId: string }) {
	const { data: playlists = [], isLoading, isError } = usePlaylists(userId);

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="aspect-video w-full rounded-2xl" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				icon={<PlaylistIcon size={40} />}
				title="Unable to load playlists"
				description="Sign in to view playlists or try again later."
			/>
		);
	}

	if (playlists.length === 0) {
		return (
			<EmptyState
				icon={<PlaylistIcon size={40} />}
				title="No playlists yet"
				description="This channel hasn't created any playlists."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{playlists.map((playlist) => (
				<PlaylistCard
					key={playlist._id}
					_id={playlist._id}
					name={playlist.name}
					description={playlist.description}
					totalVideos={playlist.totalVideos}
					firstVideoThumbnail={playlist.firstVideoThumbnail}
				/>
			))}
		</div>
	);
}

function ChannelPageSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-64 w-full rounded-2xl" />
			<div className="flex gap-2">
				<Skeleton className="h-9 w-24 rounded-full" />
				<Skeleton className="h-9 w-24 rounded-full" />
				<Skeleton className="h-9 w-24 rounded-full" />
			</div>
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<VideoCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
