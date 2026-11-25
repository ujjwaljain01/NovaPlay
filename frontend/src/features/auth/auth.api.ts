// src/features/auth/auth.api.ts

import { apiClient } from '@/api';

import type {
	ApiResponse,
	AuthUser,
	LoginCredentials,
	RegisterCredentials,
} from './auth.types';

// New helper function to handle the 2-step direct upload
export async function uploadFileToR2(
	file: File,
	uploadType: 'avatar' | 'coverImage' | 'video' | 'thumbnail',
) {
	// 1. Ask your backend for the pre-signed URL
	const { data } = await apiClient.post('/api/get-upload-url', {
		fileName: file.name,
		fileType: file.type,
		uploadType,
	});

	const { uploadUrl, publicId, publicUrl } = data;

	// 2. Upload directly to R2 using native fetch
	// Note: We use native fetch instead of apiClient so Axios interceptors
	// don't accidentally attach your app's Auth tokens to the R2 request,
	// which would cause an AWS Signature Error.
	const uploadResponse = await fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': file.type,
		},
		body: file,
	});

	if (!uploadResponse.ok) {
		throw new Error(`Failed to upload ${uploadType} to R2`);
	}

	return { publicId, publicUrl };
}

export async function loginUser(payload: LoginCredentials) {
	const { data } = await apiClient.post<
		ApiResponse<{
			user: AuthUser;
		}>
	>('/users/login', payload);

	return data.data;
}

export async function registerUser(payload: RegisterCredentials) {
	// 1. Upload the avatar directly to R2
	const avatarData = await uploadFileToR2(payload.avatar, 'avatar');

	// 2. Upload the cover image to R2 (if provided)
	let coverImageData = null;
	if (payload.coverImage) {
		coverImageData = await uploadFileToR2(payload.coverImage, 'coverImage');
	}

	// 3. Send standard JSON to your backend registration endpoint
	// You no longer need FormData since you are sending string URLs, not raw files
	const requestPayload = {
		fullName: payload.fullName,
		username: payload.username,
		email: payload.email,
		password: payload.password,
		avatar: avatarData.publicUrl,
		avatarPublicId: avatarData.publicId,
		coverImage: coverImageData?.publicUrl || '',
		coverImagePublicId: coverImageData?.publicId || '',
	};

	const { data } = await apiClient.post<ApiResponse<AuthUser>>(
		'/users/register',
		requestPayload,
	);

	return data.data;
}

export async function logoutUser() {
	await apiClient.post('/users/logout');
}

export async function refreshAccessToken() {
	await apiClient.post('/users/refresh-token');
}

export async function getCurrentUser() {
	const { data } = await apiClient.get<ApiResponse<AuthUser>>(
		'/users/current-user',
	);

	return data.data;
}

export interface UpdateAccountPayload {
	fullName: string;
	email: string;
}

export async function updateAccount(payload: UpdateAccountPayload) {
	const { data } = await apiClient.patch<ApiResponse<AuthUser>>(
		'/users/update-account',
		payload,
	);

	return data.data;
}
