import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircleIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { FormMessage } from '@/components/form/FormMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/auth.store';
import { useUpdateAccount } from '@/features/auth/mutations/useUpdateAccount';

const updateAccountSchema = z.object({
	fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
	email: z.string().trim().email('Please enter a valid email address.'),
});

type UpdateAccountValues = z.infer<typeof updateAccountSchema>;

export default function ProfilePage() {
	const { user, isLoading } = useAuthStore();
	const updateMutation = useUpdateAccount();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<UpdateAccountValues>({
		resolver: zodResolver(updateAccountSchema),
		defaultValues: {
			fullName: user?.fullName ?? '',
			email: user?.email ?? '',
		},
	});

	useEffect(() => {
		if (user) {
			reset({ fullName: user.fullName, email: user.email });
		}
	}, [user, reset]);

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Profile
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Manage your public profile details.
					</p>
				</header>

				{isLoading ? (
					<div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
						<Skeleton className="h-16 w-16 rounded-full" />
						<Skeleton className="h-10 w-full rounded-lg" />
						<Skeleton className="h-10 w-full rounded-lg" />
					</div>
				) : !user ? (
					<EmptyState
						icon={<UserCircleIcon size={40} />}
						title="Profile unavailable"
						description="Sign in to view and edit your profile."
					/>
				) : (
					<div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16 ring-1 ring-[var(--border)]">
								<AvatarImage src={user.avatar} alt={user.fullName} />
								<AvatarFallback>
									{user.fullName.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<h2 className="truncate text-lg font-semibold text-[var(--foreground)]">
									{user.fullName}
								</h2>
								<p className="truncate text-sm text-[var(--muted-foreground)]">
									@{user.username}
								</p>
							</div>
						</div>

						<form
							onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
							className="space-y-4"
						>
							<div className="space-y-1.5">
								<Label htmlFor="profile-full-name">Full Name</Label>
								<Input id="profile-full-name" {...register('fullName')} />
								<FormMessage message={errors.fullName?.message} />
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="profile-email">Email</Label>
								<Input
									id="profile-email"
									type="email"
									{...register('email')}
								/>
								<FormMessage message={errors.email?.message} />
							</div>

							<Button
								type="submit"
								disabled={updateMutation.isPending}
								className="rounded-full px-6"
							>
								{updateMutation.isPending ? 'Saving...' : 'Save changes'}
							</Button>
						</form>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
}
