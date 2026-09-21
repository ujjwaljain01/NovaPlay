export interface CommentOwner {
	_id: string;
	fullName: string;
	username: string;
	avatar: string;
}

export interface Comment {
	_id: string;
	content: string;
	owner: CommentOwner;
	createdAt: string;
	updatedAt?: string;
	likesCount?: number;
	repliesCount?: number;
	isLiked?: boolean;
}

export interface GetCommentsResponse {
	comments: Comment[];
	nextCursor: string | null;
	hasNextPage: boolean;
}
