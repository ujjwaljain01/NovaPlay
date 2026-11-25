import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
	publishVideo,
	requestUploadUrl,
	toggleVideoPublish,
	uploadBinaryToR2,
} from '../api/video.api';
import { videoQueryKeys } from '../queries/video.query-keys';
import type { VideoUploadFormValues } from '../validation/video-upload.schema';
import type { Video } from '@/types/video.types';

export type UploadStage =
	| 'idle'
	| 'uploading'
	| 'publishing'
	| 'success'
	| 'error';

const getVideoDuration = (file: File): Promise<number> =>
	new Promise((resolve, reject) => {
		const objectUrl = URL.createObjectURL(file);
		const video = document.createElement('video');
		video.preload = 'metadata';

		video.onloadedmetadata = () => {
			URL.revokeObjectURL(objectUrl);
			if (!Number.isFinite(video.duration) || video.duration <= 0) {
				reject(new Error('Could not determine video duration.'));
				return;
			}
			resolve(video.duration);
		};

		video.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(
				new Error(
					'Could not read video metadata. Please use MP4 or WebM format.',
				),
			);
		};

		video.src = objectUrl;
	});

const extractErrorMessage = (error: unknown): string => {
	if (error && typeof error === 'object') {
		const maybeAxios = error as {
			response?: { data?: { message?: string } };
			message?: string;
		};
		if (maybeAxios.response?.data?.message) {
			return maybeAxios.response.data.message;
		}
		if (maybeAxios.message) {
			return maybeAxios.message;
		}
	}
	return 'Failed to upload video. Please try again.';
};

export function useVideoUpload() {
	const queryClient = useQueryClient();

	const [stage, setStage] = useState<UploadStage>('idle');
	const [progress, setProgress] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);

	const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
	const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
		null,
	);
	const [videoDuration, setVideoDuration] = useState<number | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);
	const videoPreviewRef = useRef<string | null>(null);
	const thumbnailPreviewRef = useRef<string | null>(null);

	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
			if (videoPreviewRef.current) {
				URL.revokeObjectURL(videoPreviewRef.current);
			}
			if (thumbnailPreviewRef.current) {
				URL.revokeObjectURL(thumbnailPreviewRef.current);
			}
		};
	}, []);

	const setVideoPreview = useCallback((file: File | null) => {
		if (videoPreviewRef.current) {
			URL.revokeObjectURL(videoPreviewRef.current);
			videoPreviewRef.current = null;
		}

		if (!file) {
			setVideoPreviewUrl(null);
			setVideoDuration(null);
			return;
		}

		const nextUrl = URL.createObjectURL(file);
		videoPreviewRef.current = nextUrl;
		setVideoPreviewUrl(nextUrl);

		void getVideoDuration(file)
			.then((duration) => {
				if (videoPreviewRef.current === nextUrl) {
					setVideoDuration(duration);
				}
			})
			.catch(() => {
				if (videoPreviewRef.current === nextUrl) {
					setVideoDuration(null);
				}
			});
	}, []);

	const setThumbnailPreview = useCallback((file: File | null) => {
		if (thumbnailPreviewRef.current) {
			URL.revokeObjectURL(thumbnailPreviewRef.current);
			thumbnailPreviewRef.current = null;
		}

		if (!file) {
			setThumbnailPreviewUrl(null);
			return;
		}

		const nextUrl = URL.createObjectURL(file);
		thumbnailPreviewRef.current = nextUrl;
		setThumbnailPreviewUrl(nextUrl);
	}, []);

	const uploadMutation = useMutation({
		mutationFn: async (values: VideoUploadFormValues) => {
			abortControllerRef.current?.abort();
			const controller = new AbortController();
			abortControllerRef.current = controller;

			setStage('uploading');
			setProgress(0);
			setErrorMessage(null);
			setUploadedVideo(null);

			const duration =
				videoDuration && videoDuration > 0
					? videoDuration
					: await getVideoDuration(values.videoFile);

			const [videoPresigned, thumbnailPresigned] = await Promise.all([
				requestUploadUrl(
					{
						fileName: values.videoFile.name,
						fileType: values.videoFile.type || 'video/mp4',
						uploadType: 'video',
					},
					controller.signal,
				),
				requestUploadUrl(
					{
						fileName: values.thumbnail.name,
						fileType: values.thumbnail.type || 'image/jpeg',
						uploadType: 'thumbnail',
					},
					controller.signal,
				),
			]);

			const totalBytes = Math.max(
				1,
				values.videoFile.size + values.thumbnail.size,
			);
			let videoLoaded = 0;
			let thumbnailLoaded = 0;

			const updateCombinedProgress = () => {
				const combined = Math.min(
					100,
					Math.round(((videoLoaded + thumbnailLoaded) / totalBytes) * 100),
				);
				setProgress(combined);
			};

			await Promise.all([
				uploadBinaryToR2({
					uploadUrl: videoPresigned.uploadUrl,
					file: values.videoFile,
					signal: controller.signal,
					onProgress: (event) => {
						videoLoaded = event.loaded;
						updateCombinedProgress();
					},
				}),
				uploadBinaryToR2({
					uploadUrl: thumbnailPresigned.uploadUrl,
					file: values.thumbnail,
					signal: controller.signal,
					onProgress: (event) => {
						thumbnailLoaded = event.loaded;
						updateCombinedProgress();
					},
				}),
			]);

			setStage('publishing');

			const created = await publishVideo({
				title: values.title.trim(),
				description: values.description.trim(),
				videoFile: videoPresigned.publicUrl,
				videoPublicId: videoPresigned.publicId,
				thumbnail: thumbnailPresigned.publicUrl,
				thumbnailPublicId: thumbnailPresigned.publicId,
				duration,
			});

			if (!values.isPublished) {
				return toggleVideoPublish(created._id);
			}

			return created;
		},
		onSuccess: (video) => {
			abortControllerRef.current = null;
			setUploadedVideo(video);
			setProgress(100);
			setStage('success');
			void queryClient.invalidateQueries({ queryKey: videoQueryKeys.all });
			toast.success('Video published successfully!');
		},
		onError: (error: unknown) => {
			abortControllerRef.current = null;
			if (error instanceof DOMException && error.name === 'AbortError') {
				setStage('idle');
				setProgress(0);
				toast.info('Upload cancelled.');
				return;
			}

			const message = extractErrorMessage(error);
			setErrorMessage(message);
			setStage('error');
			toast.error(message);
		},
	});

	const startUpload = useCallback(
		(values: VideoUploadFormValues) => {
			uploadMutation.mutate(values);
		},
		[uploadMutation],
	);

	const cancelUpload = useCallback(() => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
	}, []);

	const resetUpload = useCallback(() => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		setStage('idle');
		setProgress(0);
		setErrorMessage(null);
		setUploadedVideo(null);
		setVideoPreview(null);
		setThumbnailPreview(null);
	}, [setThumbnailPreview, setVideoPreview]);

	return {
		stage,
		progress,
		errorMessage,
		uploadedVideo,
		videoPreviewUrl,
		thumbnailPreviewUrl,
		videoDuration,
		isBusy: stage === 'uploading' || stage === 'publishing',
		setVideoPreview,
		setThumbnailPreview,
		startUpload,
		cancelUpload,
		resetUpload,
	};
}
