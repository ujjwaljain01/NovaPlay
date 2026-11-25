import { useQuery } from '@tanstack/react-query';
import { getDashboardVideos } from '../api/dashboard.api';
import { dashboardQueryKeys } from '../queries/dashboard.query-keys';

export function useDashboardVideos(page = 1, limit = 10) {
	return useQuery({
		queryKey: dashboardQueryKeys.videosPage(page),
		queryFn: () => getDashboardVideos({ page, limit }),
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60 * 2,
	});
}
