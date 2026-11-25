import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';

interface SidebarSignInPromptProps {
	className?: string;
	variant?: 'sidebar' | 'page';
	title?: string;
	description?: string;
}

export function SidebarSignInPrompt({
	className,
	variant = 'sidebar',
	title = 'Sign in to view',
	description = 'Sign in to view your channel, playlists, history, and Watch Later',
}: SidebarSignInPromptProps) {
	const navigate = useNavigate();

	if (variant === 'page') {
		return (
			<div
				className={cn(
					'mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm',
					className,
				)}
			>
				<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
					<UserCircleIcon size={32} weight="duotone" />
				</div>
				<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				<p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
				<Button
					onClick={() => navigate(ROUTES.LOGIN)}
					className="mt-5 rounded-full px-6"
					variant="default"
				>
					Sign In
				</Button>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'mx-3 rounded-xl border border-border/60 bg-card/70 p-3.5',
				className,
			)}
		>
			<p className="text-xs font-semibold text-foreground">{title}</p>
			<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
				{description}
			</p>
			<Button
				onClick={() => navigate(ROUTES.LOGIN)}
				size="sm"
				className="mt-3 w-full rounded-full"
				variant="default"
			>
				Sign In
			</Button>
		</div>
	);
}
