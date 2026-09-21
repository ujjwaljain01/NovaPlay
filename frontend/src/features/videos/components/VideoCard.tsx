import type { VideoCardData } from '@/types/video.types';
import { VideoThumbnail } from './VideoThumbnail';
import { VideoMetadata } from './VideoMetadata';
import { VideoMenu } from './VideoMenu';
import { Link } from 'react-router-dom';
import { formatDuration } from '@/lib/format-duration';
import { formatViews } from '@/lib/format-views';
import { formatUploadTime } from '@/lib/format-upload-time';

interface VideoCardProps {
	video: VideoCardData;
	layout?: 'vertical' | 'horizontal';
}

export function VideoCard({ video, layout = 'vertical' }: VideoCardProps) {
	if (layout === 'horizontal') {
		const ownerObj = typeof video.owner === 'object' && video.owner !== null ? video.owner : null;
		const fullName = ownerObj?.fullName || 'Nova Creator';

		return (
			<div className="group flex gap-3 rounded-xl p-1.5 transition-colors hover:bg-accent/40">
				<Link
					to={`/watch/${video._id}`}
					className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/40"
				>
					<img
						src={video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
						alt={video.title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
					<div className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">
						{formatDuration(video.duration)}
					</div>
				</Link>

				<div className="min-w-0 flex-1">
					<Link
						to={`/watch/${video._id}`}
						className="line-clamp-2 text-xs font-semibold leading-tight text-foreground transition-colors hover:text-primary"
					>
						{video.title}
					</Link>
					<p className="mt-1 truncate text-[11px] text-muted-foreground">{fullName}</p>
					<p className="text-[11px] text-muted-foreground/80">
						{formatViews(video.views)} • {formatUploadTime(video.createdAt)}
					</p>
				</div>
			</div>
		);
	}

	return (
		<article className="group flex flex-col">
			<VideoThumbnail
				id={video._id}
				title={video.title}
				thumbnail={video.thumbnail}
				duration={video.duration}
			/>

			<div className="flex items-start justify-between gap-1">
				<VideoMetadata
					id={video._id}
					title={video.title}
					owner={video.owner}
					views={video.views}
					createdAt={video.createdAt}
				/>

				<div className="mt-2.5">
					<VideoMenu videoId={video._id} />
				</div>
			</div>
		</article>
	);
}
