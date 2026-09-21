import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import {
	ThumbsUpIcon,
	ThumbsDownIcon,
	ShareNetworkIcon,
	PlaylistIcon,
	DotsThreeIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	CheckIcon,
	UserPlusIcon,
	EyeIcon,
	CalendarBlankIcon,
} from '@phosphor-icons/react';

import { useVideo, useVideos, transformVideosToCardData, VideoCard } from '@/features/videos';
import { VideoPlayer } from '@/features/videos/components/VideoPlayer';
import { VideoCardSkeleton } from '@/features/videos/components/VideoCardSkeleton';
import { incrementVideoViews, toggleVideoLike } from '@/features/videos/api/video.api';
import { CommentSection } from '@/features/comments/components/CommentSection';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/auth.store';
import { formatViews } from '@/lib/format-views';
import { formatUploadTime } from '@/lib/format-upload-time';
import { toast } from 'sonner';

// ─── Watch Page ──────────────────────────────────────────────────

export default function WatchPage() {
	const { videoId } = useParams<{ videoId: string }>();
	const { data: video, isLoading, isError } = useVideo(videoId ?? '');
	const { isAuthenticated } = useAuthStore();
	const hasIncrementedRef = useRef(false);

	// Increment views once on mount
	useEffect(() => {
		if (videoId && !hasIncrementedRef.current) {
			hasIncrementedRef.current = true;
			incrementVideoViews(videoId).catch(() => { });
		}
	}, [videoId]);

	// Scroll to top on videoId change
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		hasIncrementedRef.current = false;
	}, [videoId]);

	if (isLoading) return <WatchPageSkeleton />;

	if (isError || !video) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center">
				<h2 className="text-2xl font-bold text-foreground">Video not found</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					This video may have been removed or the link is broken.
				</p>
				<Link to="/">
					<Button variant="outline" className="mt-4 rounded-xl">
						Back to Home
					</Button>
				</Link>
			</div>
		);
	}

	const ownerObj = typeof video.owner === 'object' && video.owner !== null ? video.owner : null;

	return (
		<div className="mx-auto max-w-[1800px] px-4 py-4 lg:px-6">
			<div className="flex flex-col gap-6 xl:flex-row">
				{/* ─── Left Column: Player + Info + Comments ────────── */}
				<div className="flex-1 min-w-0 space-y-4">
					{/* Section 1: Video Player */}
					<VideoPlayer
						src={video.videoFile}
						title={video.title}
						poster={video.thumbnail}
					/>

					{/* Section 2: Title + Actions Bar */}
					<VideoInfoBar video={video} />

					{/* Section 3: Creator + Expandable Description */}
					<CreatorDescriptionSection video={video} owner={ownerObj} />

					{/* Divider */}
					<Separator className="bg-border/50" />

					{/* Section 4: Comments */}
					<CommentSection targetId={video._id} />
				</div>

				{/* ─── Right Column: Recommendations ────────────────── */}
				<aside className="w-full shrink-0 xl:w-[400px]">
					<RecommendationsSidebar currentVideoId={video._id} />
				</aside>
			</div>
		</div>
	);
}

// ─── Section 2: Title, Views, Like/Dislike/Share/Save ────────────

function VideoInfoBar({ video }: { video: any }) {
	const { isAuthenticated } = useAuthStore();
	const [liked, setLiked] = useState(false);
	const [disliked, setDisliked] = useState(false);
	const [copied, setCopied] = useState(false);

	const likeMutation = useMutation({
		mutationFn: () => toggleVideoLike(video._id),
		onError: () => toast.error('Failed to toggle like'),
	});

	const handleLike = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to like this video');
			return;
		}
		setLiked((prev) => !prev);
		if (disliked) setDisliked(false);
		likeMutation.mutate();
	};

	const handleDislike = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to dislike this video');
			return;
		}
		setDisliked((prev) => !prev);
		if (liked) setLiked(false);
	};

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		toast.success('Link copied!');
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSave = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to save to playlist');
			return;
		}
		toast.info('Playlist feature coming soon!');
	};

	return (
		<div className="space-y-2">
			{/* Title */}
			<h1 className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl lg:text-2xl">
				{video.title}
			</h1>

			{/* Actions Row */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				{/* Views + Date */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span>{formatViews(video.views)} views</span>
					<span>•</span>
					<span>{formatUploadTime(video.createdAt)}</span>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-1.5">
					{/* Like / Dislike Pill */}
					<div className="flex items-center overflow-hidden rounded-full border border-border/60 bg-muted/50">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleLike}
							className={`gap-1.5 rounded-none rounded-l-full border-r border-border/40 px-3.5 py-2 text-xs font-semibold transition-colors ${liked ? 'text-primary bg-primary/10' : 'text-foreground'
								}`}
						>
							<ThumbsUpIcon size={18} weight={liked ? 'fill' : 'regular'} />
							<span>Like</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDislike}
							className={`rounded-none rounded-r-full px-3 py-2 text-xs transition-colors ${disliked ? 'text-foreground bg-muted' : 'text-foreground'
								}`}
						>
							<ThumbsDownIcon size={18} weight={disliked ? 'fill' : 'regular'} />
						</Button>
					</div>

					{/* Share */}
					<Button
						variant="secondary"
						size="sm"
						onClick={handleShare}
						className="gap-1.5 rounded-full px-4 text-xs font-semibold"
					>
						{copied ? (
							<CheckIcon size={16} className="text-emerald-500" />
						) : (
							<ShareNetworkIcon size={16} />
						)}
						<span>{copied ? 'Copied' : 'Share'}</span>
					</Button>

					{/* Save to Playlist */}
					<Button
						variant="secondary"
						size="sm"
						onClick={handleSave}
						className="gap-1.5 rounded-full px-4 text-xs font-semibold"
					>
						<PlaylistIcon size={16} />
						<span>Save</span>
					</Button>

					{/* More Actions (Small Screens) */}
					<Button
						variant="secondary"
						size="icon"
						className="h-8 w-8 rounded-full sm:hidden"
					>
						<DotsThreeIcon size={18} />
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── Section 3: Creator Card + Expandable Description ────────────

function CreatorDescriptionSection({
	video,
	owner,
}: {
	video: any;
	owner: any;
}) {
	const [expanded, setExpanded] = useState(false);
	const { isAuthenticated } = useAuthStore();
	const [subscribed, setSubscribed] = useState(false);

	const fullName = owner?.fullName || 'Nova Creator';
	const username = owner?.username || 'creator';
	const avatarUrl = owner?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
	const initials = fullName
		.split(' ')
		.map((n: string) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	const handleSubscribe = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to subscribe');
			return;
		}
		setSubscribed((prev) => !prev);
		toast.success(subscribed ? 'Unsubscribed' : 'Subscribed!');
	};

	return (
		<div className="rounded-2xl bg-muted/40 p-4 transition-colors">
			{/* Creator Row */}
			<div className="flex items-center justify-between gap-3">
				<Link
					to={`/channel/${username}`}
					className="group flex items-center gap-3 min-w-0"
				>
					<Avatar className="h-11 w-11 ring-2 ring-border/50 transition-transform duration-200 group-hover:scale-105">
						<AvatarImage src={avatarUrl} alt={fullName} />
						<AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							<h3 className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
								{fullName}
							</h3>
							{owner?.isVerified && (
								<CheckCircleIcon weight="fill" size={14} className="text-primary shrink-0" />
							)}
						</div>
						<p className="truncate text-xs text-muted-foreground">@{username}</p>
					</div>
				</Link>

				<Button
					onClick={handleSubscribe}
					className={`gap-1.5 rounded-full px-5 text-xs font-bold transition-all ${subscribed
							? 'bg-muted text-foreground border border-border hover:bg-muted/80'
							: 'bg-foreground text-background hover:bg-foreground/90'
						}`}
					size="sm"
				>
					{subscribed ? (
						<>
							<CheckIcon size={14} />
							<span>Subscribed</span>
						</>
					) : (
						<>
							<UserPlusIcon size={14} />
							<span>Subscribe</span>
						</>
					)}
				</Button>
			</div>

			{/* Description */}
			<div className="mt-4">
				<div className="flex items-center gap-3 text-xs font-semibold text-foreground mb-2">
					<span className="flex items-center gap-1">
						<EyeIcon size={13} />
						{formatViews(video.views)} views
					</span>
					<span className="flex items-center gap-1">
						<CalendarBlankIcon size={13} />
						{formatUploadTime(video.createdAt)}
					</span>
				</div>

				<div className={`relative ${expanded ? '' : 'max-h-[4.5em] overflow-hidden'}`}>
					<p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85 break-words">
						{video.description || 'No description provided for this video.'}
					</p>
					{!expanded && video.description && video.description.length > 150 && (
						<div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/40 to-transparent" />
					)}
				</div>

				{video.description && video.description.length > 150 && (
					<button
						onClick={() => setExpanded((prev) => !prev)}
						className="mt-2 flex items-center gap-1 text-xs font-bold text-foreground transition-colors hover:text-primary"
					>
						{expanded ? (
							<>
								<span>Show less</span>
								<CaretUpIcon size={14} />
							</>
						) : (
							<>
								<span>...more</span>
								<CaretDownIcon size={14} />
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
}

// ─── Right Sidebar: Recommended Videos ───────────────────────────

function RecommendationsSidebar({ currentVideoId }: { currentVideoId: string }) {
	const { data, isLoading } = useVideos({ limit: 12 });

	const videos = transformVideosToCardData(data?.docs ?? []).filter(
		(v) => v._id !== currentVideoId,
	);

	return (
		<div className="space-y-4">
			<h3 className="text-base font-bold tracking-tight text-foreground">Up Next</h3>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<VideoCardSkeleton key={i} layout="horizontal" />
					))}
				</div>
			) : videos.length > 0 ? (
				<div className="space-y-2">
					{videos.map((v) => (
						<VideoCard key={v._id} video={v} layout="horizontal" />
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground">No recommendations available.</p>
			)}
		</div>
	);
}

// ─── Full Page Loading Skeleton ──────────────────────────────────

function WatchPageSkeleton() {
	return (
		<div className="mx-auto max-w-[1800px] px-4 py-4 lg:px-6">
			<div className="flex flex-col gap-6 xl:flex-row">
				{/* Left column */}
				<div className="flex-1 min-w-0 space-y-4">
					{/* Player skeleton */}
					<Skeleton className="aspect-video w-full rounded-2xl" />

					{/* Title */}
					<div className="space-y-2">
						<Skeleton className="h-7 w-3/4 rounded-lg" />
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-40 rounded" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-28 rounded-full" />
								<Skeleton className="h-8 w-20 rounded-full" />
								<Skeleton className="h-8 w-20 rounded-full" />
							</div>
						</div>
					</div>

					{/* Creator card */}
					<Skeleton className="h-36 w-full rounded-2xl" />

					{/* Comments skeleton */}
					<div className="space-y-4 pt-4">
						<Skeleton className="h-5 w-32 rounded" />
						<Skeleton className="h-16 w-full rounded-xl" />
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex gap-3">
								<Skeleton className="h-9 w-9 rounded-full shrink-0" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-3 w-24 rounded" />
									<Skeleton className="h-3.5 w-full rounded" />
									<Skeleton className="h-3.5 w-2/3 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Right column */}
				<div className="w-full shrink-0 xl:w-[400px] space-y-3">
					<Skeleton className="h-5 w-20 rounded" />
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="flex gap-3">
							<Skeleton className="aspect-video w-40 shrink-0 rounded-xl" />
							<div className="flex-1 space-y-2 py-1">
								<Skeleton className="h-3.5 w-full rounded" />
								<Skeleton className="h-3 w-3/4 rounded" />
								<Skeleton className="h-3 w-1/2 rounded" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}