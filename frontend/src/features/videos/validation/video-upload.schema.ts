import { z } from 'zod';

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_VIDEO_MIME_TYPES = [
	'video/mp4',
	'video/webm',
	'video/quicktime',
	'video/x-matroska',
] as const;

export const ACCEPTED_THUMBNAIL_MIME_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
] as const;

export const videoFileSchema = z
	.instanceof(File, { message: 'Please select a video file.' })
	.refine(
		(file) =>
			(ACCEPTED_VIDEO_MIME_TYPES as readonly string[]).includes(file.type),
		'Only MP4, WebM, MOV, and MKV video files are allowed.',
	)
	.refine(
		(file) => file.size <= MAX_VIDEO_SIZE_BYTES,
		'Video file size must be 500 MB or less.',
	);

export const thumbnailFileSchema = z
	.instanceof(File, { message: 'Please select a thumbnail image.' })
	.refine(
		(file) =>
			(ACCEPTED_THUMBNAIL_MIME_TYPES as readonly string[]).includes(file.type),
		'Only JPG, PNG, and WebP thumbnail images are allowed.',
	)
	.refine(
		(file) => file.size <= MAX_THUMBNAIL_SIZE_BYTES,
		'Thumbnail size must be 5 MB or less.',
	);

export const videoUploadSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Title is required.')
		.max(120, 'Title must be 120 characters or less.'),
	description: z
		.string()
		.trim()
		.min(1, 'Description is required.')
		.max(5000, 'Description must be 5000 characters or less.'),
	isPublished: z.boolean(),
	videoFile: videoFileSchema,
	thumbnail: thumbnailFileSchema,
});

export type VideoUploadFormValues = z.infer<typeof videoUploadSchema>;
