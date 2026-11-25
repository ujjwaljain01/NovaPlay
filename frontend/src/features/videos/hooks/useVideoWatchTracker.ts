import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWriteHistory } from '@/features/history/hooks/useWriteHistory';
import { incrementVideoViews } from '../api/video.api';
import { videoQueryKeys } from '../queries/video.query-keys';
import type { EnrichedVideo } from '../types/video.schemas';

const WATCH_THRESHOLD_MS = 10_000;
const TICK_INTERVAL_MS = 250;

export interface UseVideoWatchTrackerOptions {
	videoId: string;
	isAuthenticated: boolean;
	thresholdMs?: number;
}

export interface VideoPlaybackTrackerHandlers {
	onPlay: () => void;
	onPlaying: () => void;
	onPause: () => void;
	onWaiting: () => void;
	onSeeking: () => void;
	onSeeked: () => void;
	onEnded: () => void;
}

export function useVideoWatchTracker({
	videoId,
	isAuthenticated,
	thresholdMs = WATCH_THRESHOLD_MS,
}: UseVideoWatchTrackerOptions): VideoPlaybackTrackerHandlers {
	const queryClient = useQueryClient();
	const writeHistoryMutation = useWriteHistory();

	const accumulatedMsRef = useRef(0);
	const activeStartMsRef = useRef<number | null>(null);
	const hasTriggeredRef = useRef(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const sessionTokenRef = useRef(0);

	const isPausedRef = useRef(true);
	const isWaitingRef = useRef(false);
	const isSeekingRef = useRef(false);

	const isAuthenticatedRef = useRef(isAuthenticated);
	const writeHistoryMutateRef = useRef(writeHistoryMutation.mutate);

	useEffect(() => {
		isAuthenticatedRef.current = isAuthenticated;
	}, [isAuthenticated]);

	useEffect(() => {
		writeHistoryMutateRef.current = writeHistoryMutation.mutate;
	}, [writeHistoryMutation.mutate]);

	const clearTimer = useCallback(() => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const triggerThreshold = useCallback(() => {
		if (!videoId || hasTriggeredRef.current) return;

		hasTriggeredRef.current = true;
		activeStartMsRef.current = null;
		clearTimer();

		const activeSession = sessionTokenRef.current;
		const targetVideoId = videoId;

		incrementVideoViews(targetVideoId)
			.then((updatedViews) => {
				if (sessionTokenRef.current !== activeSession) return;
				if (typeof updatedViews === 'number') {
					queryClient.setQueryData<EnrichedVideo>(
						videoQueryKeys.detail(targetVideoId),
						(prev) => (prev ? { ...prev, views: updatedViews } : prev),
					);
				}
			})
			.catch(() => {
				// View increment failure is non-blocking for playback UX.
			});

		if (isAuthenticatedRef.current) {
			writeHistoryMutateRef.current(targetVideoId);
		}
	}, [clearTimer, queryClient, videoId]);

	const checkThreshold = useCallback(() => {
		if (hasTriggeredRef.current) return;

		const runningMs =
			activeStartMsRef.current !== null
				? Math.max(0, performance.now() - activeStartMsRef.current)
				: 0;

		if (accumulatedMsRef.current + runningMs >= thresholdMs) {
			triggerThreshold();
		}
	}, [thresholdMs, triggerThreshold]);

	const flushAndStopTimer = useCallback(() => {
		if (activeStartMsRef.current !== null) {
			accumulatedMsRef.current += Math.max(
				0,
				performance.now() - activeStartMsRef.current,
			);
			activeStartMsRef.current = null;
		}
		clearTimer();
		checkThreshold();
	}, [checkThreshold, clearTimer]);

	const startTimerIfEligible = useCallback(() => {
		if (
			!videoId ||
			hasTriggeredRef.current ||
			isPausedRef.current ||
			isWaitingRef.current ||
			isSeekingRef.current
		) {
			return;
		}

		if (activeStartMsRef.current === null) {
			activeStartMsRef.current = performance.now();
		}

		if (intervalRef.current === null) {
			intervalRef.current = setInterval(checkThreshold, TICK_INTERVAL_MS);
		}
	}, [checkThreshold, videoId]);

	useEffect(() => {
		sessionTokenRef.current += 1;
		accumulatedMsRef.current = 0;
		activeStartMsRef.current = null;
		hasTriggeredRef.current = false;
		isPausedRef.current = true;
		isWaitingRef.current = false;
		isSeekingRef.current = false;
		clearTimer();

		return () => {
			sessionTokenRef.current += 1;
			clearTimer();
			activeStartMsRef.current = null;
		};
	}, [clearTimer, videoId]);

	const onPlay = useCallback(() => {
		isPausedRef.current = false;
	}, []);

	const onPlaying = useCallback(() => {
		isPausedRef.current = false;
		isWaitingRef.current = false;
		isSeekingRef.current = false;
		startTimerIfEligible();
	}, [startTimerIfEligible]);

	const onPause = useCallback(() => {
		isPausedRef.current = true;
		flushAndStopTimer();
	}, [flushAndStopTimer]);

	const onWaiting = useCallback(() => {
		isWaitingRef.current = true;
		flushAndStopTimer();
	}, [flushAndStopTimer]);

	const onSeeking = useCallback(() => {
		isSeekingRef.current = true;
		flushAndStopTimer();
	}, [flushAndStopTimer]);

	const onSeeked = useCallback(() => {
		isSeekingRef.current = false;
		startTimerIfEligible();
	}, [startTimerIfEligible]);

	const onEnded = useCallback(() => {
		isPausedRef.current = true;
		flushAndStopTimer();
	}, [flushAndStopTimer]);

	return {
		onPlay,
		onPlaying,
		onPause,
		onWaiting,
		onSeeking,
		onSeeked,
		onEnded,
	};
}
