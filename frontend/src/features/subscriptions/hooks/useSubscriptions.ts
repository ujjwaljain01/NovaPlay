import { useQuery } from '@tanstack/react-query';
import { getUserSubscriptions } from '../api/subscriptions.api';
import { subscriptionsQueryKeys } from '../queries/subscriptions.query-keys';

export function useSubscriptions(userId: string) {
	return useQuery({
		queryKey: subscriptionsQueryKeys.list(userId),
		queryFn: () => getUserSubscriptions(userId),
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	});
}
