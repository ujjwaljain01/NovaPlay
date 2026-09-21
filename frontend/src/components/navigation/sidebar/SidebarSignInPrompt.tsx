// src/components/navigation/sidebar/SidebarSignInPrompt.tsx
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SidebarSignInPrompt({ className }: { className?: string }) {
	const navigate = useNavigate();

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -6 }}
			transition={{ duration: 0.2 }}
			className={cn('px-5 py-3', className)}
		>
			<p className="mb-3 text-sm text-muted-foreground">
				Sign in to like, comment, and subscribe.
			</p>
			<Button
				onClick={() => navigate('/signin')}
				className="w-full"
				variant="default"
			>
				Sign In
			</Button>
		</motion.div>
	);
}
