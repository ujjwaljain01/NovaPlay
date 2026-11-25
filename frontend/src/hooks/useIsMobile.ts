import { useSyncExternalStore } from 'react';
import { MOBILE_BREAKPOINT } from '@/constants/layout';

const MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(callback: () => void) {
	const mediaQuery = window.matchMedia(MEDIA_QUERY);
	mediaQuery.addEventListener('change', callback);
	return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot() {
	return window.matchMedia(MEDIA_QUERY).matches;
}

function getServerSnapshot() {
	return false;
}

export function useIsMobile() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
