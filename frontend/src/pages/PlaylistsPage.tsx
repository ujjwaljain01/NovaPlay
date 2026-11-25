import { useState } from 'react';
import { PlaylistIcon, PlusIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/auth.store';
import { PlaylistCard } from '@/features/playlist/components/PlaylistCard';
import { PlaylistCreateDialog } from '@/features/playlist/components/PlaylistCreateDialog';
import { PlaylistDeleteConfirm } from '@/features/playlist/components/PlaylistDeleteConfirm';
import { PlaylistEditDialog } from '@/features/playlist/components/PlaylistEditDialog';
import { useCreatePlaylist } from '@/features/playlist/hooks/useCreatePlaylist';
import { useDeletePlaylist } from '@/features/playlist/hooks/useDeletePlaylist';
import { usePlaylists } from '@/features/playlist/hooks/usePlaylists';
import { useUpdatePlaylist } from '@/features/playlist/hooks/useUpdatePlaylist';
import type { Playlist } from '@/features/playlist/types/playlist.schemas';

export default function PlaylistsPage() {
	const userId = useAuthStore((s) => s.user?._id ?? '');
	const { data: playlists = [], isLoading, isError } = usePlaylists(userId);
	const createMutation = useCreatePlaylist();
	const updateMutation = useUpdatePlaylist();
	const deleteMutation = useDeletePlaylist();

	const [createOpen, setCreateOpen] = useState(false);
	const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
	const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(
		null,
	);

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="flex flex-wrap items-center justify-between gap-4">
					<div className="space-y-1">
						<h1 className="text-2xl font-bold text-[var(--foreground)]">
							Playlists
						</h1>
						<p className="text-sm text-[var(--muted-foreground)]">
							Create and manage your video collections.
						</p>
					</div>

					<Button
						onClick={() => setCreateOpen(true)}
						size="sm"
						className="gap-1.5 rounded-full"
					>
						<PlusIcon size={16} />
						<span>New playlist</span>
					</Button>
				</header>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="aspect-video w-full rounded-2xl" />
						))}
					</div>
				) : isError ? (
					<EmptyState
						icon={<PlaylistIcon size={40} />}
						title="Unable to load playlists"
						description="Please refresh or try again in a moment."
					/>
				) : playlists.length === 0 ? (
					<EmptyState
						icon={<PlaylistIcon size={40} />}
						title="No playlists yet"
						description="Create your first playlist to organize videos."
						action={
							<Button
								onClick={() => setCreateOpen(true)}
								size="sm"
								className="gap-1.5 rounded-full"
							>
								<PlusIcon size={16} />
								<span>Create playlist</span>
							</Button>
						}
					/>
				) : (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{playlists.map((playlist) => (
							<PlaylistCard
								key={playlist._id}
								_id={playlist._id}
								name={playlist.name}
								description={playlist.description}
								totalVideos={playlist.totalVideos}
								firstVideoThumbnail={playlist.firstVideoThumbnail}
								onEdit={() => setEditingPlaylist(playlist)}
								onDelete={() => setDeletingPlaylist(playlist)}
							/>
						))}
					</div>
				)}

				<PlaylistCreateDialog
					open={createOpen}
					onOpenChange={setCreateOpen}
					isPending={createMutation.isPending}
					onSubmit={(values) => {
						createMutation.mutate(values, {
							onSuccess: () => setCreateOpen(false),
						});
					}}
				/>

				<PlaylistEditDialog
					open={!!editingPlaylist}
					onOpenChange={(open) => {
						if (!open) setEditingPlaylist(null);
					}}
					initialName={editingPlaylist?.name ?? ''}
					initialDescription={editingPlaylist?.description ?? ''}
					isPending={updateMutation.isPending}
					onSubmit={(values) => {
						if (!editingPlaylist) return;
						updateMutation.mutate(
							{ playlistId: editingPlaylist._id, payload: values },
							{ onSuccess: () => setEditingPlaylist(null) },
						);
					}}
				/>

				<PlaylistDeleteConfirm
					open={!!deletingPlaylist}
					onOpenChange={(open) => {
						if (!open) setDeletingPlaylist(null);
					}}
					playlistName={deletingPlaylist?.name ?? ''}
					isPending={deleteMutation.isPending}
					onConfirm={() => {
						if (!deletingPlaylist) return;
						deleteMutation.mutate(deletingPlaylist._id, {
							onSuccess: () => setDeletingPlaylist(null),
						});
					}}
				/>
			</div>
		</ErrorBoundary>
	);
}
