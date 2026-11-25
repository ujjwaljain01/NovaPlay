// src/types/navigation.types.ts

import type { Icon } from '@phosphor-icons/react';

export type NavigationAction = 'feedback';

export interface NavigationItem {
	id: string;
	label: string;
	href?: string;
	action?: NavigationAction;
	icon: Icon;
	badge?: string | number;
	disabled?: boolean;
	end?: boolean; // Exact route matching
	external?: boolean; // External links
	isSignIn?: boolean;
}

export interface NavigationSection {
	id: string;

	title?: string;

	items: NavigationItem[];
}
