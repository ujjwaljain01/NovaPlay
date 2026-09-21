import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadSimpleIcon, FilmStripIcon, ImageIcon, XIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { publishVideo } from '../api/video.api';
import { videoQueryKeys } from '../queries/video.query-keys';

interface VideoUploadModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function VideoUploadModal({ open, onOpenChange }: VideoUploadModalProps) {
	const queryClient = useQueryClient();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [videoFile, setVideoFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

	const videoInputRef = useRef<HTMLInputElement>(null);
	const thumbnailInputRef = useRef<HTMLInputElement>(null);

	const handleThumbnailSelect = (file: File) => {
		setThumbnailFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setThumbnailPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const uploadMutation = useMutation({
		mutationFn: async () => {
			if (!videoFile) throw new Error('Please select a video file');
			if (!thumbnailFile) throw new Error('Please select a thumbnail image');
			if (!title.trim()) throw new Error('Please enter a video title');

			const formData = new FormData();
			formData.append('video', videoFile);
			formData.append('thumbnail', thumbnailFile);
			formData.append('title', title.trim());
			formData.append('description', description.trim());

			return publishVideo(formData);
		},
		onSuccess: () => {
			toast.success('Video uploaded successfully!');
			queryClient.invalidateQueries({ queryKey: videoQueryKeys.all });
			onOpenChange(false);
			// Reset state
			setTitle('');
			setDescription('');
			setVideoFile(null);
			setThumbnailFile(null);
			setThumbnailPreview(null);
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || err.message || 'Failed to upload video');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		uploadMutation.mutate();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card p-6 shadow-2xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold tracking-tight">Upload Video</DialogTitle>
					<DialogDescription>
						Share your story with the NovaPlay community.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="mt-4 space-y-5">
					{/* Video File Picker */}
					<div className="space-y-2">
						<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Video File (MP4, WebM)
						</Label>
						<input
							type="file"
							ref={videoInputRef}
							accept="video/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) setVideoFile(file);
							}}
						/>
						{videoFile ? (
							<div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 p-3.5">
								<div className="flex items-center gap-3 truncate">
									<FilmStripIcon size={24} className="text-primary shrink-0" />
									<div className="truncate text-left">
										<p className="truncate text-sm font-medium text-foreground">{videoFile.name}</p>
										<p className="text-xs text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
									</div>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={() => setVideoFile(null)}
								>
									<XIcon size={16} />
								</Button>
							</div>
						) : (
							<div
								onClick={() => videoInputRef.current?.click()}
								className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-6 transition-all hover:border-primary/60 hover:bg-muted/40"
							>
								<UploadSimpleIcon size={32} className="text-muted-foreground mb-2" />
								<p className="text-sm font-medium text-foreground">Click to select video</p>
								<p className="text-xs text-muted-foreground mt-0.5">MP4, WebM or MKV</p>
							</div>
						)}
					</div>

					{/* Thumbnail Picker */}
					<div className="space-y-2">
						<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Custom Thumbnail
						</Label>
						<input
							type="file"
							ref={thumbnailInputRef}
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleThumbnailSelect(file);
							}}
						/>
						{thumbnailPreview ? (
							<div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
								<img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover" />
								<Button
									type="button"
									variant="secondary"
									size="icon"
									className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-black/90"
									onClick={() => {
										setThumbnailFile(null);
										setThumbnailPreview(null);
									}}
								>
									<XIcon size={14} />
								</Button>
							</div>
						) : (
							<div
								onClick={() => thumbnailInputRef.current?.click()}
								className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-4 transition-all hover:border-primary/60 hover:bg-muted/40"
							>
								<ImageIcon size={24} className="text-muted-foreground mb-1" />
								<p className="text-xs font-medium text-foreground">Upload Thumbnail (16:9 recommended)</p>
							</div>
						)}
					</div>

					{/* Title & Description */}
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="video-title">Title</Label>
							<Input
								id="video-title"
								placeholder="Give your video a catchy title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								className="h-10 rounded-xl"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="video-desc">Description</Label>
							<Textarea
								id="video-desc"
								placeholder="Tell viewers what your video is about..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={3}
								className="rounded-xl resize-none"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={uploadMutation.isPending}
							className="rounded-xl"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={uploadMutation.isPending || !videoFile || !thumbnailFile || !title.trim()}
							className="gap-2 rounded-xl"
						>
							{uploadMutation.isPending && (
								<SpinnerGapIcon size={18} className="animate-spin" />
							)}
							<span>{uploadMutation.isPending ? 'Publishing...' : 'Publish Video'}</span>
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
