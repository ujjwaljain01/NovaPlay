import { z } from 'zod';

export const studioVideoEditSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Title is required')
		.max(120, 'Title cannot exceed 120 characters'),
	description: z
		.string()
		.trim()
		.min(1, 'Description is required')
		.max(5000, 'Description cannot exceed 5000 characters'),
	isPublished: z.boolean(),
});

export type StudioVideoEditValues = z.infer<typeof studioVideoEditSchema>;
