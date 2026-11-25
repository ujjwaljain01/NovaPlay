import { Controller, type UseFormReturn } from 'react-hook-form';
import {
	FilmStripIcon,
	GlobeIcon,
	ImageIcon,
	LockIcon,
	UploadSimpleIcon,
} from '@phosphor-icons/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDuration } from '@/lib/format-duration';
import { cn } from '@/lib/utils';
import {
	ACCEPTED_THUMBNAIL_MIME_TYPES,
	ACCEPTED_VIDEO_MIME_TYPES,
	type VideoUploadFormValues,
} from '../../validation/video-upload.schema';
import { MediaDropzone } from './MediaDropzone';

interface VideoMetadataFormProps {
	form: UseFormReturn<VideoUploadFormValues>;
	disabled?: boolean;
	videoPreviewUrl: string | null;
	thumbnailPreviewUrl: string | null;
	videoDuration: number | null;
	onVideoFileChange: (file: File | null) => void;
	onThumbnailFileChange: (file: File | null) => void;
	onSubmit: (values: VideoUploadFormValues) => void;
}

const formatFileSizeMB = (bytes: number) =>
	`${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function VideoMetadataForm({
	form,
	disabled = false,
	videoPreviewUrl,
	thumbnailPreviewUrl,
	videoDuration,
	onVideoFileChange,
	onThumbnailFileChange,
	onSubmit,
}: VideoMetadataFormProps) {
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	return (
		<form
			id="video-upload-form"
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-5"
			noValidate
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<Controller
					control={control}
					name="videoFile"
					render={({ field }) => (
						<MediaDropzone
							id="video-file-input"
							label="Video File"
							accept={ACCEPTED_VIDEO_MIME_TYPES.join(',')}
							emptyTitle="Drop video or click to browse"
							emptySubtitle="MP4, WebM, MOV, MKV (max 500 MB)"
							file={field.value ?? null}
							error={errors.videoFile?.message}
							disabled={disabled}
							icon={<UploadSimpleIcon size={28} />}
							onFileSelect={(file) => {
								field.onChange(file as File);
								onVideoFileChange(file);
							}}
							renderPreview={(file) => (
								<div className="space-y-2">
									{videoPreviewUrl ? (
										<video
											src={videoPreviewUrl}
											controls
											preload="metadata"
											className="aspect-video w-full rounded-lg bg-background object-contain"
										/>
									) : (
										<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
											<FilmStripIcon
												size={28}
												className="text-muted-foreground"
											/>
										</div>
									)}
									<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
										<span className="truncate font-medium text-foreground">
											{file.name}
										</span>
										<span className="shrink-0">
											{formatFileSizeMB(file.size)}
											{videoDuration && videoDuration > 0
												? ` • ${formatDuration(Math.round(videoDuration))}`
												: ''}
										</span>
									</div>
								</div>
							)}
						/>
					)}
				/>

				<Controller
					control={control}
					name="thumbnail"
					render={({ field }) => (
						<MediaDropzone
							id="thumbnail-file-input"
							label="Thumbnail"
							accept={ACCEPTED_THUMBNAIL_MIME_TYPES.join(',')}
							emptyTitle="Drop thumbnail or click to browse"
							emptySubtitle="JPG, PNG, WebP (16:9, max 5 MB)"
							file={field.value ?? null}
							error={errors.thumbnail?.message}
							disabled={disabled}
							icon={<ImageIcon size={28} />}
							onFileSelect={(file) => {
								field.onChange(file as File);
								onThumbnailFileChange(file);
							}}
							renderPreview={(file) => (
								<div className="space-y-2">
									{thumbnailPreviewUrl ? (
										<img
											src={thumbnailPreviewUrl}
											alt="Thumbnail preview"
											className="aspect-video w-full rounded-lg object-cover"
										/>
									) : (
										<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
											<ImageIcon size={28} className="text-muted-foreground" />
										</div>
									)}
									<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
										<span className="truncate font-medium text-foreground">
											{file.name}
										</span>
										<span className="shrink-0">
											{formatFileSizeMB(file.size)}
										</span>
									</div>
								</div>
							)}
						/>
					)}
				/>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="video-title">Title</Label>
				<Input
					id="video-title"
					placeholder="Give your video a catchy title"
					disabled={disabled}
					aria-invalid={Boolean(errors.title)}
					className="h-10 rounded-xl"
					{...register('title')}
				/>
				{errors.title && (
					<p className="text-xs text-destructive">{errors.title.message}</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="video-description">Description</Label>
				<Textarea
					id="video-description"
					placeholder="Tell viewers what your video is about..."
					rows={3}
					disabled={disabled}
					aria-invalid={Boolean(errors.description)}
					className="resize-none rounded-xl"
					{...register('description')}
				/>
				{errors.description && (
					<p className="text-xs text-destructive">
						{errors.description.message}
					</p>
				)}
			</div>

			<Controller
				control={control}
				name="isPublished"
				render={({ field }) => (
					<div className="space-y-1.5">
						<Label>Visibility</Label>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								disabled={disabled}
								onClick={() => field.onChange(true)}
								className={cn(
									'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
									field.value
										? 'border-primary bg-primary/10 text-foreground'
										: 'border-border bg-card text-muted-foreground hover:bg-muted/40',
								)}
							>
								<GlobeIcon
									size={18}
									className={field.value ? 'text-primary' : undefined}
								/>
								<div>
									<p className="font-medium leading-none">Public</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Visible in home feed
									</p>
								</div>
							</button>

							<button
								type="button"
								disabled={disabled}
								onClick={() => field.onChange(false)}
								className={cn(
									'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
									!field.value
										? 'border-primary bg-primary/10 text-foreground'
										: 'border-border bg-card text-muted-foreground hover:bg-muted/40',
								)}
							>
								<LockIcon
									size={18}
									className={!field.value ? 'text-primary' : undefined}
								/>
								<div>
									<p className="font-medium leading-none">Private</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Hidden from public feed
									</p>
								</div>
							</button>
						</div>
					</div>
				)}
			/>
		</form>
	);
}
