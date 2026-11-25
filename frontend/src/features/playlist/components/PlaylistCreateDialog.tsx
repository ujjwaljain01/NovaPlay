import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/form/FormMessage';
import {
	playlistFormSchema,
	type PlaylistFormValues,
} from '../validation/playlist.schema';

interface PlaylistCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isPending?: boolean;
	onSubmit: (values: PlaylistFormValues) => void;
}

export function PlaylistCreateDialog({
	open,
	onOpenChange,
	isPending = false,
	onSubmit,
}: PlaylistCreateDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PlaylistFormValues>({
		resolver: zodResolver(playlistFormSchema),
		defaultValues: { name: '', description: '' },
	});

	const handleFormSubmit = (values: PlaylistFormValues) => {
		onSubmit(values);
		reset();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create playlist</DialogTitle>
					<DialogDescription>
						Organize videos into a custom collection.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className="space-y-4"
				>
					<div className="space-y-1.5">
						<Label htmlFor="playlist-create-name">Name</Label>
						<Input
							id="playlist-create-name"
							placeholder="My favorite tutorials"
							{...register('name')}
						/>
						<FormMessage message={errors.name?.message} />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="playlist-create-description">Description</Label>
						<Textarea
							id="playlist-create-description"
							placeholder="What is this playlist about?"
							rows={3}
							{...register('description')}
						/>
						<FormMessage message={errors.description?.message} />
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? 'Creating...' : 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
