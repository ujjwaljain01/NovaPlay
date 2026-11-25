import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import {
	CheckIcon,
	DesktopIcon,
	LockKeyIcon,
	MoonIcon,
	MoonStarsIcon,
	PlayCircleIcon,
	SunDimIcon,
	UserCircleIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiClient } from '@/api';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FormMessage } from '@/components/form/FormMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/features/auth/auth.store';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';
import { usePlaybackSettingsStore } from '@/store/playback-settings.store';
import type { Theme } from '@/types/theme.types';

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

const PRIMARY_THEME_OPTIONS: ReadonlyArray<{
	value: Extract<Theme, 'light' | 'dark'>;
	label: string;
	description: string;
	icon: typeof SunDimIcon;
}> = [
	{
		value: 'light',
		label: 'Light',
		description: 'Warm, bright surface for daytime viewing.',
		icon: SunDimIcon,
	},
	{
		value: 'dark',
		label: 'Dark',
		description: 'High-contrast dark interface for low-light rooms.',
		icon: MoonIcon,
	},
];

const EXTRA_THEME_OPTIONS: ReadonlyArray<{
	value: Extract<Theme, 'night' | 'system'>;
	label: string;
	icon: typeof DesktopIcon;
}> = [
	{ value: 'night', label: 'Night', icon: MoonStarsIcon },
	{ value: 'system', label: 'System', icon: DesktopIcon },
];

export default function SettingsPage() {
	const { user, isAuthenticated } = useAuthStore();
	const { theme, resolvedTheme, setTheme } = useTheme();
	const autoplay = usePlaybackSettingsStore((s) => s.autoplay);
	const toggleAutoplay = usePlaybackSettingsStore((s) => s.toggleAutoplay);

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
					<h1 className="text-2xl font-bold text-foreground">Settings</h1>
					<p className="text-sm text-muted-foreground">
						Customize appearance, playback preferences, and account details.
					</p>
				</header>

				{/* Appearance / Theme Selector */}
				<section className="space-y-4 rounded-2xl border border-border bg-card p-6">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-foreground">
							Appearance
						</h2>
						<p className="text-sm text-muted-foreground">
							Choose your preferred NovaPlay theme. Currently active:{' '}
							<span className="font-medium capitalize text-foreground">
								{theme === 'system' ? `System (${resolvedTheme})` : theme}
							</span>
							.
						</p>
					</div>

					<div
						role="radiogroup"
						aria-label="Theme selection"
						className="grid gap-3 sm:grid-cols-2"
					>
						{PRIMARY_THEME_OPTIONS.map((option) => {
							const Icon = option.icon;
							const isSelected =
								theme === option.value ||
								(theme === 'system' && resolvedTheme === option.value);

							return (
								<button
									key={option.value}
									type="button"
									role="radio"
									aria-checked={theme === option.value}
									onClick={() => setTheme(option.value)}
									className={cn(
										'flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
										isSelected
											? 'border-primary bg-primary/10'
											: 'border-border bg-background hover:bg-accent/50',
									)}
								>
									<div className="flex items-start gap-3">
										<div
											className={cn(
												'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
												isSelected
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-border bg-muted text-muted-foreground',
											)}
										>
											<Icon
												size={18}
												weight={isSelected ? 'fill' : 'duotone'}
											/>
										</div>
										<div>
											<p className="text-sm font-semibold text-foreground">
												{option.label}
											</p>
											<p className="mt-0.5 text-xs text-muted-foreground">
												{option.description}
											</p>
										</div>
									</div>

									{isSelected && (
										<CheckIcon
											size={18}
											weight="bold"
											className="mt-1 shrink-0 text-primary"
										/>
									)}
								</button>
							);
						})}
					</div>

					<div className="flex flex-wrap items-center gap-2 pt-1">
						<span className="text-xs text-muted-foreground">More options:</span>
						{EXTRA_THEME_OPTIONS.map((option) => {
							const Icon = option.icon;
							const isSelected = theme === option.value;

							return (
								<Button
									key={option.value}
									type="button"
									variant={isSelected ? 'default' : 'outline'}
									size="sm"
									onClick={() => setTheme(option.value)}
									className="rounded-full"
								>
									<Icon size={15} weight={isSelected ? 'fill' : 'duotone'} />
									<span>{option.label}</span>
								</Button>
							);
						})}
					</div>
				</section>

				{/* Playback Preferences */}
				<section className="space-y-4 rounded-2xl border border-border bg-card p-6">
					<div className="flex items-center gap-2">
						<PlayCircleIcon
							size={20}
							weight="duotone"
							className="text-primary"
						/>
						<h2 className="text-lg font-semibold text-foreground">Playback</h2>
					</div>

					<div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
						<div className="space-y-0.5">
							<Label
								htmlFor="settings-autoplay-toggle"
								className="cursor-pointer text-sm font-semibold text-foreground"
							>
								Autoplay videos
							</Label>
							<p className="text-xs text-muted-foreground">
								Automatically start playing videos when you open a watch page.
							</p>
						</div>

						<button
							id="settings-autoplay-toggle"
							type="button"
							role="switch"
							aria-checked={autoplay}
							aria-label="Toggle video autoplay"
							onClick={toggleAutoplay}
							className={cn(
								'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
								autoplay ? 'bg-primary' : 'bg-muted',
							)}
						>
							<span
								className={cn(
									'pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform',
									autoplay ? 'translate-x-5' : 'translate-x-0.5',
								)}
							/>
						</button>
					</div>
				</section>

				{/* Account / Channel Profile Shortcut & Security */}
				{isAuthenticated && user ? (
					<>
						<section className="space-y-4 rounded-2xl border border-border bg-card p-6">
							<div className="flex items-center gap-2">
								<UserCircleIcon
									size={20}
									weight="duotone"
									className="text-primary"
								/>
								<h2 className="text-lg font-semibold text-foreground">
									Channel & Account
								</h2>
							</div>

							<div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center">
								<div className="flex min-w-0 items-center gap-3">
									<Avatar className="h-12 w-12 ring-1 ring-border">
										<AvatarImage src={user.avatar} alt={user.fullName} />
										<AvatarFallback>
											{user.fullName.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-foreground">
											{user.fullName}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											@{user.username}
										</p>
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<Link to={`/channel/${user.username}`}>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="rounded-full"
										>
											View Channel
										</Button>
									</Link>
									<Link to={ROUTES.PROFILE}>
										<Button
											type="button"
											size="sm"
											className="rounded-full"
										>
											Edit Profile
										</Button>
									</Link>
								</div>
							</div>
						</section>

						<section className="space-y-4 rounded-2xl border border-border bg-card p-6">
							<div className="flex items-center gap-2">
								<LockKeyIcon size={20} className="text-primary" />
								<h2 className="text-lg font-semibold text-foreground">
									Change Password
								</h2>
							</div>

							<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
								<div className="space-y-1.5">
									<Label htmlFor="settings-old-password">
										Current Password
									</Label>
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
					</>
				) : (
					<section className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
						<div className="space-y-1">
							<h2 className="text-base font-semibold text-foreground">
								Account & Channel Settings
							</h2>
							<p className="text-sm text-muted-foreground">
								Sign in to edit your channel profile or update your password.
							</p>
						</div>
						<Link to={ROUTES.LOGIN}>
							<Button type="button" className="rounded-full px-5">
								Sign in
							</Button>
						</Link>
					</section>
				)}
			</div>
		</ErrorBoundary>
	);
}
