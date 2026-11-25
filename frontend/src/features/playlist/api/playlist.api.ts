import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	PlaylistDetailSchema,
	PlaylistListSchema,
	PlaylistSchema,
	type Playlist,
	type PlaylistDetail,
} from '../types/playlist.schemas';

export interface CreatePlaylistPayload {
	name: string;
	description: string;
}

export interface UpdatePlaylistPayload {
	name?: string;
	description?: string;
}

export const createPlaylist = async (
	payload: CreatePlaylistPayload,
): Promise<Playlist> => {
	const { data } = await apiClient.post<ApiResponse<unknown>>(
		API.playlist.create,
		payload,
	);
	return PlaylistSchema.parse(data.data);
};

export const getUserPlaylists = async (
	userId: string,
): Promise<Playlist[]> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.playlist.list(userId),
	);
	return PlaylistListSchema.parse(data.data);
};

export const getPlaylistById = async (
	playlistId: string,
): Promise<PlaylistDetail> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.playlist.detail(playlistId),
	);
	return PlaylistDetailSchema.parse(data.data);
};

export const updatePlaylist = async (
	playlistId: string,
	payload: UpdatePlaylistPayload,
): Promise<Playlist> => {
	const { data } = await apiClient.patch<ApiResponse<unknown>>(
		API.playlist.update(playlistId),
		payload,
	);
	return PlaylistSchema.parse(data.data);
};

export const deletePlaylist = async (playlistId: string): Promise<void> => {
	await apiClient.delete<ApiResponse<unknown>>(
		API.playlist.delete(playlistId),
	);
};

export const addVideoToPlaylist = async (
	videoId: string,
	playlistId: string,
): Promise<Playlist> => {
	const { data } = await apiClient.patch<ApiResponse<unknown>>(
		API.playlist.addVideo(videoId, playlistId),
	);
	return PlaylistSchema.parse(data.data);
};

export const removeVideoFromPlaylist = async (
	videoId: string,
	playlistId: string,
): Promise<Playlist> => {
	const { data } = await apiClient.patch<ApiResponse<unknown>>(
		API.playlist.removeVideo(videoId, playlistId),
	);
	return PlaylistSchema.parse(data.data);
};
