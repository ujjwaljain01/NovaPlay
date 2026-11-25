import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { buildNavigationSections } from '@/data/navigation';

export function useNavigation() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const username = useAuthStore((state) => state.user?.username);

	return useMemo(
		() => buildNavigationSections({ isAuthenticated, username }),
		[isAuthenticated, username],
	);
}
