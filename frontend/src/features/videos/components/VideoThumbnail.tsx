import { Link } from 'react-router-dom';
import { formatDuration } from '@/lib/format-duration';

interface VideoThumbnailProps {
	id: string;
	title: string;
	thumbnail: string;
	duration: number;
}

export function VideoThumbnail({
	id,
	title,
	thumbnail,
	duration,
}: VideoThumbnailProps) {
	return (
		<Link
			to={`/watch/${id}`}
			className="group relative block aspect-video overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:shadow-md hover:ring-primary/40"
		>
			<img
				src={thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
				alt={title}
				loading="lazy"
				className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
			/>

			<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			<div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/85 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-white backdrop-blur-sm shadow">
				{formatDuration(duration)}
			</div>
		</Link>
	);
}
