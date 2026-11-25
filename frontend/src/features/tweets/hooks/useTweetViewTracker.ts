import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { recordTweetView } from '../api/tweet.api';
import { setTweetViewsInCache } from '../utils/tweet-cache';

const TWEET_DWELL_MS = 5000;
const VISIBILITY_THRESHOLD = 0.6;

interface TrackerState {
	tweetId: string;
	optimisticDelta: number;
	authoritativeViews: number | null;
}

export interface UseTweetViewTrackerOptions {
	tweetId: string;
	initialViews?: number;
	dwellMs?: number;
	threshold?: number;
}

export function useTweetViewTracker({
	tweetId,
	initialViews = 0,
	dwellMs = TWEET_DWELL_MS,
	threshold = VISIBILITY_THRESHOLD,
}: UseTweetViewTrackerOptions) {
	const queryClient = useQueryClient();
	const elementRef = useRef<HTMLElement | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasFiredRef = useRef(false);

	const [trackerState, setTrackerState] = useState<TrackerState>({
		tweetId,
		optimisticDelta: 0,
		authoritativeViews: null,
	});

	useEffect(() => {
		hasFiredRef.current = false;

		const clearPendingTimer = () => {
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};

		const node = elementRef.current;
		if (
			!node ||
			!tweetId ||
			typeof IntersectionObserver === 'undefined'
		) {
			return clearPendingTimer;
		}

		let cancelled = false;

		const triggerView = () => {
			if (hasFiredRef.current || cancelled) return;
			hasFiredRef.current = true;
			clearPendingTimer();

			setTrackerState((prev) => ({
				tweetId,
				optimisticDelta: prev.tweetId === tweetId ? prev.optimisticDelta + 1 : 1,
				authoritativeViews:
					prev.tweetId === tweetId ? prev.authoritativeViews : null,
			}));

			recordTweetView(tweetId)
				.then((result) => {
					if (cancelled) return;
					if (typeof result?.views === 'number') {
						setTrackerState({
							tweetId,
							optimisticDelta: 0,
							authoritativeViews: result.views,
						});
						setTweetViewsInCache(queryClient, tweetId, result.views);
					}
				})
				.catch(() => {
					if (cancelled) return;
					setTrackerState((prev) => ({
						tweetId,
						optimisticDelta:
							prev.tweetId === tweetId
								? Math.max(0, prev.optimisticDelta - 1)
								: 0,
						authoritativeViews:
							prev.tweetId === tweetId ? prev.authoritativeViews : null,
					}));
				});
		};

		const observer = new IntersectionObserver(
			(entries) => {
				if (hasFiredRef.current || cancelled) return;

				const entry = entries[0];
				if (!entry) return;

				const isVisibleEnough =
					entry.isIntersecting && entry.intersectionRatio >= threshold;

				if (isVisibleEnough) {
					if (timerRef.current === null) {
						timerRef.current = setTimeout(triggerView, dwellMs);
					}
				} else {
					clearPendingTimer();
				}
			},
			{
				threshold: [0, threshold, 1],
			},
		);

		observer.observe(node);

		return () => {
			cancelled = true;
			clearPendingTimer();
			observer.disconnect();
		};
	}, [dwellMs, queryClient, threshold, tweetId]);

	const displayViews =
		trackerState.tweetId === tweetId
			? (trackerState.authoritativeViews ??
				initialViews + trackerState.optimisticDelta)
			: initialViews;

	return {
		ref: elementRef,
		displayViews,
	};
}
