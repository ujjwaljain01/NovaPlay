import { Link } from 'react-router-dom';
import { CaretRightIcon } from '@phosphor-icons/react';
import type { VideoCardData } from '@/types/video.types';
import { VideoCard } from './VideoCard';

interface VideoSectionProps {
	title: string;
	videos: VideoCardData[];
	viewAllHref?: string;
	icon?: React.ReactNode;
}

export function VideoSection({
	title,
	videos,
	viewAllHref,
	icon,
}: VideoSectionProps) {
	if (!videos || videos.length === 0) return null;

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					{icon && <span className="text-primary">{icon}</span>}
					<h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						{title}
					</h2>
				</div>

				{viewAllHref && (
					<Link
						to={viewAllHref}
						className="group flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
					>
						<span>View all</span>
						<CaretRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
					</Link>
				)}
			</div>

			<div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
				{videos.map((video) => (
					<VideoCard key={video._id} video={video} />
				))}
			</div>
		</section>
	);
}
