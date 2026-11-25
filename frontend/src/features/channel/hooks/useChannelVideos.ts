import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
	getChannelVideos,
	type GetChannelVideosParams,
} from '../api/channel.api';
import { channelQueryKeys } from '../queries/channel.query-keys';

export function useChannelVideos(
	username: string,
	params: GetChannelVideosParams = {},
) {
	return useQuery({
		queryKey: channelQueryKeys.videosList(username, { ...params }),
		queryFn: () => getChannelVideos(username, params),
		enabled: !!username,
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60 * 5,
		retry: (failureCount, error) => {
			if (isAxiosError(error) && error.response?.status === 404) {
				return false;
			}
			return failureCount < 1;
		},
	});
}
