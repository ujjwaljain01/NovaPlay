import { Link } from 'react-router-dom';
import {
	ArrowSquareOutIcon,
	CheckCircleIcon,
	SpinnerGapIcon,
	WarningCircleIcon,
} from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import type { Video } from '@/types/video.types';
import type { UploadStage } from '../../hooks/useVideoUpload';

interface UploadStatusPanelProps {
	stage: UploadStage;
	progress: number;
	errorMessage: string | null;
	uploadedVideo: Video | null;
	onCancel: () => void;
	onRetry: () => void;
	onResetAndClose: () => void;
	onUploadAnother: () => void;
}

export function UploadStatusPanel({
	stage,
	progress,
	errorMessage,
	uploadedVideo,
	onCancel,
	onRetry,
	onResetAndClose,
	onUploadAnother,
}: UploadStatusPanelProps) {
	if (stage === 'uploading' || stage === 'publishing') {
		const isPublishing = stage === 'publishing';
		return (
			<div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
				<div className="flex items-center justify-between gap-2 text-sm">
					<div className="flex items-center gap-2 font-medium text-foreground">
						<SpinnerGapIcon size={18} className="animate-spin text-primary" />
						<span>
							{isPublishing
								? 'Publishing video metadata...'
								: 'Uploading media to storage...'}
						</span>
					</div>
					<span className="font-mono text-xs font-semibold text-primary">
						{progress}%
					</span>
				</div>

				<div
					role="progressbar"
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
					className="h-2 w-full overflow-hidden rounded-full bg-muted"
				>
					<div
						className="h-full rounded-full bg-primary transition-all duration-200"
						style={{ width: `${progress}%` }}
					/>
				</div>

				{!isPublishing && (
					<div className="flex justify-end">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onCancel}
							className="text-muted-foreground hover:text-foreground"
						>
							Cancel Upload
						</Button>
					</div>
				)}
			</div>
		);
	}

	if (stage === 'error' && errorMessage) {
		return (
			<div
				role="alert"
				className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
			>
				<div className="flex items-start gap-2.5 text-destructive">
					<WarningCircleIcon size={18} className="mt-0.5 shrink-0" />
					<p className="font-medium">{errorMessage}</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onRetry}
					className="shrink-0 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
				>
					Retry
				</Button>
			</div>
		);
	}

	if (stage === 'success' && uploadedVideo) {
		return (
			<div className="space-y-4 rounded-xl border border-success/40 bg-success/10 p-5 text-center">
				<CheckCircleIcon size={36} className="mx-auto text-success" />
				<div className="space-y-1">
					<h3 className="text-base font-semibold text-foreground">
						Video Published
					</h3>
					<p className="text-sm text-muted-foreground">
						&ldquo;{uploadedVideo.title}&rdquo; is ready.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-2.5">
					<Link
						to={`/watch/${uploadedVideo._id}`}
						onClick={onResetAndClose}
						className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						<span>Watch Video</span>
						<ArrowSquareOutIcon size={16} />
					</Link>
					<Button
						type="button"
						variant="outline"
						onClick={onUploadAnother}
						className="rounded-xl"
					>
						Upload Another
					</Button>
				</div>
			</div>
		);
	}

	return null;
}
