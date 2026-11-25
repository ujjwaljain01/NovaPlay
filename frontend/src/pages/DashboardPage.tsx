import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	ChatCircleDotsIcon,
	EyeIcon,
	HeartIcon,
	UsersIcon,
	VideoCameraIcon,
} from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useDashboardVideos } from '@/features/dashboard/hooks/useDashboardVideos';
import { useTogglePublish } from '@/features/dashboard/hooks/useTogglePublish';
import { formatUploadTime } from '@/lib/format-upload-time';
import { formatViews } from '@/lib/format-views';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
	const [page, setPage] = useState(1);
	const {
		data: stats,
		isLoading: statsLoading,
		isError: statsError,
	} = useDashboardStats();
	const {
		data: videosData,
		isLoading: videosLoading,
		isError: videosError,
	} = useDashboardVideos(page);
	const togglePublishMutation = useTogglePublish();

	const videos = videosData?.docs ?? [];

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Creator Dashboard
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Overview of your channel performance and uploaded videos.
					</p>
				</header>

				{/* Stats Grid */}
				{statsLoading ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-24 w-full rounded-2xl" />
						))}
					</div>
				) : statsError || !stats ? (
					<EmptyState
						icon={<VideoCameraIcon size={36} />}
						title="Unable to load channel stats"
						description="Please refresh or try again in a moment."
					/>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<StatCard
							label="Videos"
							value={stats.videos}
							icon={<VideoCameraIcon size={18} />}
						/>
						<StatCard
							label="Total Views"
							value={stats.totalViews}
							icon={<EyeIcon size={18} />}
						/>
						<StatCard
							label="Subscribers"
							value={stats.subscriberCount}
							icon={<UsersIcon size={18} />}
						/>
						<StatCard
							label="Comments"
							value={stats.totalComments}
							icon={<ChatCircleDotsIcon size={18} />}
						/>
						<StatCard
							label="Likes"
							value={stats.totalLikes}
							icon={<HeartIcon size={18} />}
						/>
					</div>
				)}

				{/* Videos Table */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold text-[var(--foreground)]">
						Uploaded Videos
					</h2>

					{videosLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-16 w-full rounded-xl" />
							))}
						</div>
					) : videosError ? (
						<EmptyState
							icon={<VideoCameraIcon size={40} />}
							title="Unable to load your videos"
							description="Please refresh or try again in a moment."
						/>
					) : videos.length === 0 ? (
						<EmptyState
							icon={<VideoCameraIcon size={40} />}
							title="No videos uploaded yet"
							description="Upload your first video to see analytics and manage publishing."
						/>
					) : (
						<>
							<div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
								<table className="w-full min-w-[640px] text-left text-sm">
									<thead className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-xs uppercase text-[var(--muted-foreground)]">
										<tr>
											<th className="px-4 py-3 font-semibold">Video</th>
											<th className="px-4 py-3 font-semibold">Status</th>
											<th className="px-4 py-3 font-semibold">Views</th>
											<th className="px-4 py-3 font-semibold">Likes</th>
											<th className="px-4 py-3 font-semibold">Comments</th>
											<th className="px-4 py-3 font-semibold">Uploaded</th>
											<th className="px-4 py-3 text-right font-semibold">
												Action
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[var(--border)]">
										{videos.map((video) => (
											<tr
												key={video._id}
												className="hover:bg-[var(--muted)]/30"
											>
												<td className="px-4 py-3">
													<Link
														to={`/watch/${video._id}`}
														className="flex items-center gap-3 font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
													>
														<img
															src={video.thumbnail}
															alt={video.title}
															className="h-10 w-16 shrink-0 rounded-md object-cover bg-[var(--muted)]"
														/>
														<span className="line-clamp-1">{video.title}</span>
													</Link>
												</td>
												<td className="px-4 py-3">
													<span
														className={cn(
															'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
															video.isPublished
																? 'bg-[var(--success)]/15 text-[var(--success)]'
																: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
														)}
													>
														{video.isPublished ? 'Published' : 'Draft'}
													</span>
												</td>
												<td className="px-4 py-3 text-[var(--muted-foreground)]">
													{formatViews(video.views)}
												</td>
												<td className="px-4 py-3 text-[var(--muted-foreground)]">
													{video.likeCount}
												</td>
												<td className="px-4 py-3 text-[var(--muted-foreground)]">
													{video.commentCount}
												</td>
												<td className="px-4 py-3 text-[var(--muted-foreground)]">
													{formatUploadTime(video.createdAt)}
												</td>
												<td className="px-4 py-3 text-right">
													<Button
														type="button"
														variant="outline"
														size="sm"
														disabled={togglePublishMutation.isPending}
														onClick={() =>
															togglePublishMutation.mutate(video._id)
														}
													>
														{video.isPublished ? 'Unpublish' : 'Publish'}
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{videosData && videosData.totalPages > 1 ? (
								<div className="flex items-center justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={page <= 1}
										onClick={() => setPage((p) => Math.max(1, p - 1))}
									>
										Previous
									</Button>
									<span className="text-xs text-[var(--muted-foreground)]">
										Page {page} of {videosData.totalPages}
									</span>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={!videosData.hasNextPage}
										onClick={() => setPage((p) => p + 1)}
									>
										Next
									</Button>
								</div>
							) : null}
						</>
					)}
				</section>
			</div>
		</ErrorBoundary>
	);
}

function StatCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
			<div className="flex items-center justify-between text-[var(--muted-foreground)]">
				<span className="text-xs font-medium">{label}</span>
				{icon}
			</div>
			<p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
				{formatViews(value)}
			</p>
		</div>
	);
}
