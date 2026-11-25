// src/features/videos/api/video.api.ts

import { API, apiClient } from '@/api';

import type {
	ApiResponse,
	GetVideosResponse,
	Video,
} from '@/types/video.types';
import {
	EnrichedVideoSchema,
	type EnrichedVideo,
} from '../types/video.schemas';

export interface GetVideosParams {
	page?: number;

	limit?: number;

	query?: string;

	sortBy?: string;

	sortType?: 'asc' | 'desc';

	userId?: string;
}

export const getVideos = async (params: GetVideosParams = {}) => {
	const { data } = await apiClient.get<ApiResponse<GetVideosResponse>>(
		'/videos',
		{
			params,
		},
	);

	return data.data;
};

export const getVideo = async (videoId: string): Promise<EnrichedVideo> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.videos.byId(videoId),
	);

	return EnrichedVideoSchema.parse(data.data);
};

export const incrementVideoViews = async (videoId: string): Promise<number> => {
	const { data } = await apiClient.patch<ApiResponse<number>>(
		API.videos.incrementViews(videoId),
	);

	return data.data;
};

export type R2UploadType = 'video' | 'thumbnail';

export interface RequestUploadUrlParams {
	fileName: string;
	fileType: string;
	uploadType: R2UploadType;
}

export interface PresignedUploadResponse {
	uploadUrl: string;
	publicId: string;
	publicUrl: string;
}

export interface UploadProgressEvent {
	loaded: number;
	total: number;
	percentage: number;
}

export interface UploadBinaryToR2Params {
	uploadUrl: string;
	file: File;
	onProgress?: (progress: UploadProgressEvent) => void;
	signal?: AbortSignal;
}

/**
 * Requests a pre-signed R2 PUT URL from the backend.
 * Note: /users/get-upload-url returns raw JSON { uploadUrl, publicId, publicUrl }.
 */
export const requestUploadUrl = async (
	params: RequestUploadUrlParams,
	signal?: AbortSignal,
): Promise<PresignedUploadResponse> => {
	const { data } = await apiClient.post<PresignedUploadResponse>(
		API.users.getUploadUrl,
		params,
		{ signal },
	);

	return data;
};

/**
 * Uploads a File directly to Cloudflare R2 via XMLHttpRequest so upload
 * progress events and AbortSignal cancellation work without attaching app auth headers.
 */
export const uploadBinaryToR2 = ({
	uploadUrl,
	file,
	onProgress,
	signal,
}: UploadBinaryToR2Params): Promise<void> =>
	new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new DOMException('Upload aborted', 'AbortError'));
			return;
		}

		const xhr = new XMLHttpRequest();

		const cleanup = () => {
			signal?.removeEventListener('abort', handleAbort);
		};

		const handleAbort = () => {
			xhr.abort();
		};

		signal?.addEventListener('abort', handleAbort, { once: true });

		xhr.upload.onprogress = (event) => {
			if (!event.lengthComputable || event.total <= 0) return;
			const percentage = Math.min(
				100,
				Math.round((event.loaded / event.total) * 100),
			);
			onProgress?.({
				loaded: event.loaded,
				total: event.total,
				percentage,
			});
		};

		xhr.onload = () => {
			cleanup();
			if (xhr.status >= 200 && xhr.status < 300) {
				onProgress?.({
					loaded: file.size,
					total: file.size,
					percentage: 100,
				});
				resolve();
				return;
			}
			reject(
				new Error(`Storage upload failed with status ${xhr.status}`),
			);
		};

		xhr.onerror = () => {
			cleanup();
			reject(new Error('Network error during storage upload'));
		};

		xhr.onabort = () => {
			cleanup();
			reject(new DOMException('Upload aborted', 'AbortError'));
		};

		xhr.open('PUT', uploadUrl);
		xhr.setRequestHeader(
			'Content-Type',
			file.type || 'application/octet-stream',
		);
		xhr.send(file);
	});

export interface PublishVideoPayload {
	title: string;
	description: string;
	videoFile: string;
	videoPublicId: string;
	thumbnail: string;
	thumbnailPublicId: string;
	duration: number;
}

export const publishVideo = async (payload: PublishVideoPayload) => {
	const { data } = await apiClient.post<ApiResponse<Video>>(
		API.videos.all,
		payload,
	);

	return data.data;
};

export const deleteVideo = async (videoId: string) => {
	const { data } = await apiClient.delete<ApiResponse<null>>(
		`/videos/${videoId}`,
	);

	return data.data;
};

export const toggleVideoLike = async (videoId: string) => {
	const { data } = await apiClient.post<ApiResponse<unknown>>(
		API.likes.toggleVideo(videoId),
	);

	return data.data;
};

export const getLikedVideos = async () => {
	const { data } = await apiClient.get<ApiResponse<Video[]>>(
		'/likes/videos',
	);

	return data.data;
};

export const toggleVideoPublish = async (videoId: string) => {
	const { data } = await apiClient.patch<ApiResponse<Video>>(
		`/videos/${videoId}/toggle-publish`,
	);

	return data.data;
};
