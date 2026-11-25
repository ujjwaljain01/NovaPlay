import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboard.api';
import { dashboardQueryKeys } from '../queries/dashboard.query-keys';

export function useDashboardStats() {
	return useQuery({
		queryKey: dashboardQueryKeys.stats(),
		queryFn: getDashboardStats,
		staleTime: 1000 * 60 * 2,
	});
}
