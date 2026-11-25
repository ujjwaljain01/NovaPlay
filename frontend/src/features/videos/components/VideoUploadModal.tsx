import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerGapIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useVideoUpload } from '../hooks/useVideoUpload';
import {
	videoUploadSchema,
	type VideoUploadFormValues,
} from '../validation/video-upload.schema';
import { UploadStatusPanel, VideoMetadataForm } from './upload';

interface VideoUploadModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function VideoUploadModal({
	open,
	onOpenChange,
}: VideoUploadModalProps) {
	const form = useForm<VideoUploadFormValues>({
		resolver: zodResolver(videoUploadSchema),
		defaultValues: {
			title: '',
			description: '',
			isPublished: true,
		},
	});

	const {
		stage,
		progress,
		errorMessage,
		uploadedVideo,
		videoPreviewUrl,
		thumbnailPreviewUrl,
		videoDuration,
		isBusy,
		setVideoPreview,
		setThumbnailPreview,
		startUpload,
		cancelUpload,
		resetUpload,
	} = useVideoUpload();

	useEffect(() => {
		if (!open) {
			form.reset({
				title: '',
				description: '',
				isPublished: true,
			});
			resetUpload();
		}
	}, [form, open, resetUpload]);

	const handleDialogOpenChange = (nextOpen: boolean) => {
		if (!nextOpen && isBusy) {
			return;
		}
		onOpenChange(nextOpen);
	};

	const handleUploadAnother = () => {
		form.reset({
			title: '',
			description: '',
			isPublished: true,
		});
		resetUpload();
	};

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent
				showCloseButton={!isBusy}
				className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl sm:max-w-2xl"
			>
				<DialogHeader>
					<DialogTitle className="text-xl font-bold tracking-tight">
						Upload Video
					</DialogTitle>
					<DialogDescription>
						Share your video with the NovaPlay community.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-2 space-y-5">
					{stage === 'success' ? (
						<UploadStatusPanel
							stage={stage}
							progress={progress}
							errorMessage={errorMessage}
							uploadedVideo={uploadedVideo}
							onCancel={cancelUpload}
							onRetry={form.handleSubmit(startUpload)}
							onResetAndClose={() => onOpenChange(false)}
							onUploadAnother={handleUploadAnother}
						/>
					) : (
						<>
							<VideoMetadataForm
								form={form}
								disabled={isBusy}
								videoPreviewUrl={videoPreviewUrl}
								thumbnailPreviewUrl={thumbnailPreviewUrl}
								videoDuration={videoDuration}
								onVideoFileChange={setVideoPreview}
								onThumbnailFileChange={setThumbnailPreview}
								onSubmit={startUpload}
							/>

							<UploadStatusPanel
								stage={stage}
								progress={progress}
								errorMessage={errorMessage}
								uploadedVideo={uploadedVideo}
								onCancel={cancelUpload}
								onRetry={form.handleSubmit(startUpload)}
								onResetAndClose={() => onOpenChange(false)}
								onUploadAnother={handleUploadAnother}
							/>

							<div className="flex items-center justify-end gap-3 pt-1">
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										isBusy ? cancelUpload() : onOpenChange(false)
									}
									className="rounded-xl"
								>
									{isBusy ? 'Cancel Upload' : 'Cancel'}
								</Button>
								<Button
									type="submit"
									form="video-upload-form"
									disabled={isBusy}
									className="gap-2 rounded-xl"
								>
									{isBusy && (
										<SpinnerGapIcon size={18} className="animate-spin" />
									)}
									<span>
										{stage === 'publishing'
											? 'Publishing...'
											: stage === 'uploading'
												? `Uploading (${progress}%)`
												: 'Publish Video'}
									</span>
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
