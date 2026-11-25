import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { FormMessage } from '@/components/form/FormMessage';
import { ImagePicker } from '@/components/media/ImagePicker';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { StudioVideo } from '../types/studio.schemas';
import {
	studioVideoEditSchema,
	type StudioVideoEditValues,
} from '../validation/studio-video.schema';

interface StudioVideoEditDialogProps {
	video: StudioVideo | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isPending?: boolean;
	onSubmit: (values: StudioVideoEditValues & { thumbnailFile?: File }) => void;
}

export function StudioVideoEditDialog({
	video,
	open,
	onOpenChange,
	isPending = false,
	onSubmit,
}: StudioVideoEditDialogProps) {
	const [thumbnailFile, setThumbnailFile] = useState<File | undefined>();

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<StudioVideoEditValues>({
		resolver: zodResolver(studioVideoEditSchema),
		defaultValues: {
			title: video?.title ?? '',
			description: video?.description ?? '',
			isPublished: video?.isPublished ?? true,
		},
	});

	useEffect(() => {
		if (open && video) {
			reset({
				title: video.title,
				description: video.description,
				isPublished: video.isPublished,
			});
		}
	}, [open, video, reset]);

	const handleDialogOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setThumbnailFile(undefined);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit Video</DialogTitle>
					<DialogDescription>
						Update video metadata, thumbnail image, and visibility.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit((values) =>
						onSubmit({ ...values, thumbnailFile }),
					)}
					className="space-y-4"
				>
					<div className="space-y-1.5">
						<Label htmlFor="studio-video-title">Title</Label>
						<Input id="studio-video-title" {...register('title')} />
						<FormMessage message={errors.title?.message} />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="studio-video-description">Description</Label>
						<Textarea
							id="studio-video-description"
							rows={4}
							{...register('description')}
						/>
						<FormMessage message={errors.description?.message} />
					</div>

					<div className="space-y-2">
						<Label>Thumbnail</Label>
						{!thumbnailFile && video?.thumbnail ? (
							<div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
								<img
									src={video.thumbnail}
									alt={video.title}
									className="aspect-video w-full object-cover"
								/>
							</div>
						) : null}
						<ImagePicker
							value={thumbnailFile}
							onChange={setThumbnailFile}
							placeholder="Upload new thumbnail (optional)"
						/>
					</div>

					<div className="space-y-1.5">
						<Label>Visibility</Label>
						<Controller
							control={control}
							name="isPublished"
							render={({ field }) => (
								<div className="grid grid-cols-2 gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => field.onChange(true)}
										className={cn(
											'justify-start gap-2',
											field.value &&
												'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]',
										)}
									>
										<EyeIcon size={16} />
										<span>Public</span>
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => field.onChange(false)}
										className={cn(
											'justify-start gap-2',
											!field.value &&
												'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]',
										)}
									>
										<EyeSlashIcon size={16} />
										<span>Private</span>
									</Button>
								</div>
							)}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleDialogOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? 'Saving...' : 'Save changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
