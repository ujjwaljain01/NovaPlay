import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FeatherIcon, VideoCameraIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/auth.store';
import { StudioStatsGrid } from '@/features/studio/components/StudioStatsGrid';
import { StudioTweetsManager } from '@/features/studio/components/StudioTweetsManager';
import { StudioVideoDeleteDialog } from '@/features/studio/components/StudioVideoDeleteDialog';
import { StudioVideoEditDialog } from '@/features/studio/components/StudioVideoEditDialog';
import { StudioVideosTable } from '@/features/studio/components/StudioVideosTable';
import { useDeleteStudioVideo } from '@/features/studio/hooks/useDeleteStudioVideo';
import { useMyVideos } from '@/features/studio/hooks/useMyVideos';
import { useStudioStats } from '@/features/studio/hooks/useStudioStats';
import { useUpdateStudioVideo } from '@/features/studio/hooks/useUpdateStudioVideo';
import type { StudioVideo } from '@/features/studio/types/studio.schemas';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';

type StudioTab = 'videos' | 'tweets';

export default function StudioPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const userId = useAuthStore((s) => s.user?._id ?? '');

	const isVideosRoute = location.pathname.startsWith(ROUTES.STUDIO_VIDEOS);
	const activeTab: StudioTab =
		!isVideosRoute && searchParams.get('tab') === 'tweets'
			? 'tweets'
			: 'videos';

	const {
		data: stats,
		isLoading: statsLoading,
		isError: statsError,
	} = useStudioStats();
	const {
		data: videos = [],
		isLoading: videosLoading,
		isError: videosError,
	} = useMyVideos();

	const updateVideoMutation = useUpdateStudioVideo();
	const deleteVideoMutation = useDeleteStudioVideo();

	const [editingVideo, setEditingVideo] = useState<StudioVideo | null>(null);
	const [deletingVideo, setDeletingVideo] = useState<StudioVideo | null>(null);

	const handleTabChange = (tab: StudioTab) => {
		if (tab === 'videos') {
			navigate(ROUTES.STUDIO_VIDEOS);
			return;
		}
		navigate(`${ROUTES.STUDIO}?tab=tweets`);
	};

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Creator Studio
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Manage your videos, tweets, visibility, and channel performance.
					</p>
				</header>

				<StudioStatsGrid
					stats={stats}
					isLoading={statsLoading}
					isError={statsError}
				/>

				<div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
					<Button
						type="button"
						variant={activeTab === 'videos' ? 'default' : 'ghost'}
						size="sm"
						onClick={() => handleTabChange('videos')}
						className={cn('gap-2 rounded-full')}
					>
						<VideoCameraIcon size={16} />
						<span>Your Videos</span>
					</Button>
					<Button
						type="button"
						variant={activeTab === 'tweets' ? 'default' : 'ghost'}
						size="sm"
						onClick={() => handleTabChange('tweets')}
						className={cn('gap-2 rounded-full')}
					>
						<FeatherIcon size={16} />
						<span>Tweets</span>
					</Button>
				</div>

				{activeTab === 'videos' ? (
					<section className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-[var(--foreground)]">
								Your Videos
							</h2>
							<span className="text-xs text-[var(--muted-foreground)]">
								{videos.length} {videos.length === 1 ? 'video' : 'videos'}
							</span>
						</div>

						<StudioVideosTable
							videos={videos}
							isLoading={videosLoading}
							isError={videosError}
							onEdit={setEditingVideo}
							onDelete={setDeletingVideo}
						/>
					</section>
				) : (
					<section className="space-y-4">
						<h2 className="text-lg font-semibold text-[var(--foreground)]">
							Manage Tweets
						</h2>
						{userId ? <StudioTweetsManager userId={userId} /> : null}
					</section>
				)}

				<StudioVideoEditDialog
					key={editingVideo?._id ?? 'closed'}
					video={editingVideo}
					open={!!editingVideo}
					onOpenChange={(open) => {
						if (!open) setEditingVideo(null);
					}}
					isPending={updateVideoMutation.isPending}
					onSubmit={(values) => {
						if (!editingVideo) return;
						updateVideoMutation.mutate(
							{
								videoId: editingVideo._id,
								...values,
							},
							{
								onSuccess: () => setEditingVideo(null),
							},
						);
					}}
				/>

				<StudioVideoDeleteDialog
					open={!!deletingVideo}
					onOpenChange={(open) => {
						if (!open) setDeletingVideo(null);
					}}
					videoTitle={deletingVideo?.title ?? ''}
					isPending={deleteVideoMutation.isPending}
					onConfirm={() => {
						if (!deletingVideo) return;
						deleteVideoMutation.mutate(deletingVideo._id, {
							onSuccess: () => setDeletingVideo(null),
						});
					}}
				/>
			</div>
		</ErrorBoundary>
	);
}
