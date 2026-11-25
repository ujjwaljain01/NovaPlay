import { useQuery } from '@tanstack/react-query';
import { getChannelProfile } from '../api/channel.api';
import { channelQueryKeys } from '../queries/channel.query-keys';

export function useChannelProfile(username: string) {
	return useQuery({
		queryKey: channelQueryKeys.profile(username),
		queryFn: () => getChannelProfile(username),
		enabled: !!username,
		staleTime: 1000 * 60 * 5,
	});
}
