import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import type { Tweet, GetTweetsResponse } from '../types/tweet.types';

export interface GetTweetsParams {
	limit?: number;
	nextCursor?: string;
}

export const getTweets = async (params: GetTweetsParams = {}) => {
	const { data } = await apiClient.get<ApiResponse<GetTweetsResponse>>(
		'/tweets',
		{
			params,
		},
	);
	return data.data;
};

export const getUserTweets = async (userId: string) => {
	const { data } = await apiClient.get<ApiResponse<Tweet[]>>(
		`/tweets/user/${userId}`,
	);
	return data.data;
};

export const getTweetById = async (tweetId: string) => {
	const { data } = await apiClient.get<ApiResponse<Tweet>>(
		`/tweets/${tweetId}`,
	);
	return data.data;
};

export const createTweet = async (content: string) => {
	const { data } = await apiClient.post<ApiResponse<Tweet>>(
		'/tweets',
		{
			content,
		},
	);
	return data.data;
};

export const deleteTweet = async (tweetId: string) => {
	const { data } = await apiClient.delete<ApiResponse<null>>(
		`/tweets/${tweetId}`,
	);
	return data.data;
};

export const toggleTweetLike = async (tweetId: string) => {
	const { data } = await apiClient.post<ApiResponse<any>>(
		`/likes/toggle/t/${tweetId}`,
	);
	return data.data;
};
