import { create } from 'zustand';

interface FeedbackModalState {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	setOpen: (isOpen: boolean) => void;
}

export const useFeedbackModalStore = create<FeedbackModalState>()((set) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	setOpen: (isOpen) => set({ isOpen }),
}));
