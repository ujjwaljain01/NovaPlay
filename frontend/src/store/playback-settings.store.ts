import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlaybackSettingsState {
	autoplay: boolean;
	setAutoplay: (autoplay: boolean) => void;
	toggleAutoplay: () => void;
}

export const usePlaybackSettingsStore = create<PlaybackSettingsState>()(
	persist(
		(set) => ({
			autoplay: false,
			setAutoplay: (autoplay) => set({ autoplay }),
			toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
		}),
		{
			name: 'novaplay-playback-settings',
		},
	),
);
