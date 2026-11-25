import { useQuery } from '@tanstack/react-query';
import {
	searchContent,
	type SearchContentParams,
} from '../api/search.api';
import { searchQueryKeys } from '../queries/search.query-keys';

export function useSearchResults(params: SearchContentParams) {
	const hasQuery = params.q.trim().length > 0;
	const hasTag = (params.tag?.trim().length ?? 0) > 0;

	return useQuery({
		queryKey: searchQueryKeys.results({ ...params }),
		queryFn: () => searchContent(params),
		enabled: hasQuery || hasTag,
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60 * 2,
	});
}
