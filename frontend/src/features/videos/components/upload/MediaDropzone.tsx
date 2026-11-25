import { useRef, useState } from 'react';
import { XIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MediaDropzoneProps {
	id: string;
	label: string;
	accept: string;
	emptyTitle: string;
	emptySubtitle: string;
	file: File | null;
	error?: string;
	disabled?: boolean;
	icon: React.ReactNode;
	onFileSelect: (file: File | null) => void;
	renderPreview: (file: File) => React.ReactNode;
}

export function MediaDropzone({
	id,
	label,
	accept,
	emptyTitle,
	emptySubtitle,
	file,
	error,
	disabled = false,
	icon,
	onFileSelect,
	renderPreview,
}: MediaDropzoneProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handlePickedFile = (picked: File | undefined) => {
		if (!picked || disabled) return;
		onFileSelect(picked);
	};

	const handleClear = () => {
		if (disabled) return;
		if (inputRef.current) {
			inputRef.current.value = '';
		}
		onFileSelect(null);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		if (disabled) return;
		handlePickedFile(e.dataTransfer.files?.[0]);
	};

	return (
		<div className="space-y-1.5">
			<Label
				htmlFor={id}
				className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			>
				{label}
			</Label>

			<input
				id={id}
				ref={inputRef}
				type="file"
				accept={accept}
				disabled={disabled}
				className="hidden"
				onChange={(e) => handlePickedFile(e.target.files?.[0])}
			/>

			{file ? (
				<div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
					<Button
						type="button"
						variant="secondary"
						size="icon"
						aria-label={`Remove ${label}`}
						disabled={disabled}
						onClick={handleClear}
						className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full shadow-sm"
					>
						<XIcon size={14} />
					</Button>
					{renderPreview(file)}
				</div>
			) : (
				<div
					role="button"
					tabIndex={disabled ? -1 : 0}
					aria-disabled={disabled}
					onClick={() => !disabled && inputRef.current?.click()}
					onKeyDown={(e) => {
						if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
							e.preventDefault();
							inputRef.current?.click();
						}
					}}
					onDragOver={(e) => {
						e.preventDefault();
						if (!disabled) setIsDragging(true);
					}}
					onDragLeave={(e) => {
						e.preventDefault();
						setIsDragging(false);
					}}
					onDrop={handleDrop}
					className={cn(
						'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						isDragging
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-primary/60 hover:bg-muted/40',
						error && 'border-destructive bg-destructive/5',
						disabled && 'pointer-events-none opacity-60',
					)}
				>
					<div className="mb-2 text-muted-foreground">{icon}</div>
					<p className="text-sm font-medium text-foreground">{emptyTitle}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{emptySubtitle}
					</p>
				</div>
			)}

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
