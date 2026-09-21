import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

interface VideoPlayerProps {
	src: string;
	title: string;
	poster?: string;
	onPlay?: () => void;
	onEnded?: () => void;
	className?: string;
}

export function VideoPlayer({
	src,
	title,
	poster,
	onPlay,
	onEnded,
	className = '',
}: VideoPlayerProps) {
	return (
		<div className={`overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-border/50 ${className}`}>
			<MediaPlayer
				title={title}
				src={src}
				poster={poster}
				playsInline
				onPlay={onPlay}
				onEnded={onEnded}
				className="aspect-video w-full"
			>
				<MediaProvider>
					{poster && (
						<Poster
							className="vds-poster"
							src={poster}
							alt={title}
						/>
					)}
				</MediaProvider>
				<DefaultVideoLayout icons={defaultLayoutIcons} />
			</MediaPlayer>
		</div>
	);
}
