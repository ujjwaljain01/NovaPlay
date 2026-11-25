import { useEffect } from 'react';
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

interface PlaylistEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialName: string;
	initialDescription: string;
	isPending?: boolean;
	onSubmit: (values: PlaylistFormValues) => void;
}

export function PlaylistEditDialog({
	open,
	onOpenChange,
	initialName,
	initialDescription,
	isPending = false,
	onSubmit,
}: PlaylistEditDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PlaylistFormValues>({
		resolver: zodResolver(playlistFormSchema),
		defaultValues: {
			name: initialName,
			description: initialDescription,
		},
	});

	useEffect(() => {
		if (open) {
			reset({ name: initialName, description: initialDescription });
		}
	}, [open, initialName, initialDescription, reset]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit playlist</DialogTitle>
					<DialogDescription>
						Update the title and description of your playlist.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="playlist-edit-name">Name</Label>
						<Input id="playlist-edit-name" {...register('name')} />
						<FormMessage message={errors.name?.message} />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="playlist-edit-description">Description</Label>
						<Textarea
							id="playlist-edit-description"
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
							{isPending ? 'Saving...' : 'Save changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
