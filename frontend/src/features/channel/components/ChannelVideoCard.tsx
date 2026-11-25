import { HeartIcon } from '@phosphor-icons/react';
import { VideoCard } from '@/features/videos/components/VideoCard';
import type { ChannelVideo } from '../types/channel.schemas';

interface ChannelVideoCardProps {
	video: ChannelVideo;
}

export function ChannelVideoCard({ video }: ChannelVideoCardProps) {
	return (
		<div className="relative flex flex-col">
			<VideoCard
				video={{
					_id: video._id,
					title: video.title,
					thumbnail: video.thumbnail,
					duration: video.duration,
					views: video.views,
					createdAt: video.createdAt,
					owner: video.owner,
				}}
			/>

			<div className="mt-1 flex items-center gap-1 px-1 text-xs text-[var(--muted-foreground)]">
				<HeartIcon size={13} />
				<span>
					{video.likeCount} {video.likeCount === 1 ? 'like' : 'likes'}
				</span>
			</div>
		</div>
	);
}
