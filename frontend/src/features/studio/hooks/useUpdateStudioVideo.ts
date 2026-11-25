import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	requestUploadUrl,
	uploadBinaryToR2,
} from '@/features/videos/api/video.api';
import { videoQueryKeys } from '@/features/videos/queries/video.query-keys';
import { channelQueryKeys } from '@/features/channel/queries/channel.query-keys';
import {
	updateStudioVideo,
	type UpdateStudioVideoPayload,
} from '../api/studio.api';
import { studioQueryKeys } from '../queries/studio.query-keys';

export interface UpdateStudioVideoInput {
	videoId: string;
	title: string;
	description: string;
	isPublished: boolean;
	thumbnailFile?: File;
}

export function useUpdateStudioVideo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			videoId,
			title,
			description,
			isPublished,
			thumbnailFile,
		}: UpdateStudioVideoInput) => {
			const payload: UpdateStudioVideoPayload = {
				title: title.trim(),
				description: description.trim(),
				isPublished,
			};

			if (thumbnailFile) {
				const presigned = await requestUploadUrl({
					fileName: thumbnailFile.name,
					fileType: thumbnailFile.type || 'image/jpeg',
					uploadType: 'thumbnail',
				});
				await uploadBinaryToR2({
					uploadUrl: presigned.uploadUrl,
					file: thumbnailFile,
				});
				payload.thumbnail = presigned.publicUrl;
				payload.thumbnailPublicId = presigned.publicId;
			}

			return updateStudioVideo(videoId, payload);
		},
		onSuccess: (_data, { videoId }) => {
			toast.success('Video updated successfully');
			void queryClient.invalidateQueries({ queryKey: studioQueryKeys.all });
			void queryClient.invalidateQueries({
				queryKey: videoQueryKeys.detail(videoId),
			});
			void queryClient.invalidateQueries({ queryKey: videoQueryKeys.lists() });
			void queryClient.invalidateQueries({ queryKey: channelQueryKeys.all });
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to update video');
		},
	});
}
