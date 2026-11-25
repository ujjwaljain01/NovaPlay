import { Link } from 'react-router-dom';
import {
	EyeIcon,
	EyeSlashIcon,
	PencilSimpleIcon,
	TrashIcon,
	VideoCameraIcon,
} from '@phosphor-icons/react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUploadTime } from '@/lib/format-upload-time';
import { formatViews } from '@/lib/format-views';
import { cn } from '@/lib/utils';
import type { StudioVideo } from '../types/studio.schemas';

interface StudioVideosTableProps {
	videos: StudioVideo[];
	isLoading: boolean;
	isError: boolean;
	onEdit: (video: StudioVideo) => void;
	onDelete: (video: StudioVideo) => void;
}

export function StudioVideosTable({
	videos,
	isLoading,
	isError,
	onEdit,
	onDelete,
}: StudioVideosTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton
						key={i}
						className="h-16 w-full rounded-xl bg-[var(--skeleton)]"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				icon={<VideoCameraIcon size={40} />}
				title="Unable to load your videos"
				description="Please refresh or try again in a moment."
			/>
		);
	}

	if (videos.length === 0) {
		return (
			<EmptyState
				icon={<VideoCameraIcon size={40} />}
				title="No videos uploaded yet"
				description="Use the Create button in the top bar to upload your first video."
			/>
		);
	}

	return (
		<div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
			<table className="w-full min-w-[760px] text-left text-sm">
				<thead className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-xs uppercase text-[var(--muted-foreground)]">
					<tr>
						<th className="px-4 py-3 font-semibold">Video</th>
						<th className="px-4 py-3 font-semibold">Visibility</th>
						<th className="px-4 py-3 font-semibold">Upload Date</th>
						<th className="px-4 py-3 font-semibold">Views</th>
						<th className="px-4 py-3 font-semibold">Likes</th>
						<th className="px-4 py-3 font-semibold">Comments</th>
						<th className="px-4 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[var(--border)]">
					{videos.map((video) => (
						<tr key={video._id} className="hover:bg-[var(--muted)]/30">
							<td className="px-4 py-3">
								<Link
									to={`/watch/${video._id}`}
									className="flex items-center gap-3 font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
								>
									<img
										src={video.thumbnail}
										alt={video.title}
										className="h-11 w-20 shrink-0 rounded-lg bg-[var(--muted)] object-cover"
									/>
									<div className="min-w-0">
										<p className="line-clamp-1 font-semibold">{video.title}</p>
										{video.description ? (
											<p className="line-clamp-1 text-xs text-[var(--muted-foreground)]">
												{video.description}
											</p>
										) : null}
									</div>
								</Link>
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
										video.isPublished
											? 'bg-[var(--success)]/15 text-[var(--success)]'
											: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
									)}
								>
									{video.isPublished ? (
										<EyeIcon size={12} />
									) : (
										<EyeSlashIcon size={12} />
									)}
									<span>{video.isPublished ? 'Public' : 'Private'}</span>
								</span>
							</td>
							<td className="px-4 py-3 text-[var(--muted-foreground)]">
								{formatUploadTime(video.createdAt)}
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
							<td className="px-4 py-3 text-right">
								<div className="inline-flex items-center gap-1.5">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => onEdit(video)}
										className="gap-1.5"
									>
										<PencilSimpleIcon size={14} />
										<span>Edit</span>
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => onDelete(video)}
										aria-label={`Delete ${video.title}`}
										className="gap-1.5 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
									>
										<TrashIcon size={14} />
										<span>Delete</span>
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
