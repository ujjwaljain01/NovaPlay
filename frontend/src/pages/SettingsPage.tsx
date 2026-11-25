import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockKeyIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiClient } from '@/api';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FormMessage } from '@/components/form/FormMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const changePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, 'Current password is required.'),
		newPassword: z
			.string()
			.min(8, 'New password must be at least 8 characters.'),
		confirmPassword: z.string().min(1, 'Please confirm your new password.'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (values: ChangePasswordValues) => {
		try {
			// Known backend bug: `user.controller.js` sets `user.passowrd = newPassword`
			// (typo), so password changes do not persist server-side until fixed in a
			// separate backend follow-up change.
			await apiClient.post('/users/change-password', {
				oldPassword: values.oldPassword,
				newPassword: values.newPassword,
			});
			toast.success('Password change request submitted');
			reset();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Failed to change password';
			toast.error(message);
		}
	};

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Settings
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Manage your account security preferences.
					</p>
				</header>

				<section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
					<div className="flex items-center gap-2">
						<LockKeyIcon size={20} className="text-[var(--primary)]" />
						<h2 className="text-lg font-semibold text-[var(--foreground)]">
							Change Password
						</h2>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="settings-old-password">Current Password</Label>
							<Input
								id="settings-old-password"
								type="password"
								{...register('oldPassword')}
							/>
							<FormMessage message={errors.oldPassword?.message} />
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="settings-new-password">New Password</Label>
							<Input
								id="settings-new-password"
								type="password"
								{...register('newPassword')}
							/>
							<FormMessage message={errors.newPassword?.message} />
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="settings-confirm-password">
								Confirm New Password
							</Label>
							<Input
								id="settings-confirm-password"
								type="password"
								{...register('confirmPassword')}
							/>
							<FormMessage message={errors.confirmPassword?.message} />
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="rounded-full px-6"
						>
							{isSubmitting ? 'Updating...' : 'Update password'}
						</Button>
					</form>
				</section>
			</div>
		</ErrorBoundary>
	);
}
