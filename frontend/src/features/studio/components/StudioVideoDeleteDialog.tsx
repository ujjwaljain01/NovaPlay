import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface StudioVideoDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	videoTitle: string;
	isPending?: boolean;
	onConfirm: () => void;
}

export function StudioVideoDeleteDialog({
	open,
	onOpenChange,
	videoTitle,
	isPending = false,
	onConfirm,
}: StudioVideoDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete video</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete &ldquo;{videoTitle}&rdquo;? It will
						also be removed from all playlists and watch history. This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? 'Deleting...' : 'Delete video'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
