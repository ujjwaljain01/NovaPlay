import { useQuery } from '@tanstack/react-query';
import {
	searchContent,
	type SearchContentParams,
} from '../api/search.api';
import { searchQueryKeys } from '../queries/search.query-keys';

export function useSearchResults(params: SearchContentParams) {
	return useQuery({
		queryKey: searchQueryKeys.results({ ...params }),
		queryFn: () => searchContent(params),
		enabled: params.q.trim().length > 0,
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60 * 2,
	});
}
