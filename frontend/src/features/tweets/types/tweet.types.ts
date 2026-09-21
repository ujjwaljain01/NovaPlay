export interface TweetOwner {
	_id: string;
	fullName: string;
	username: string;
	avatar: string;
}

export interface Tweet {
	_id: string;
	content: string;
	owner: TweetOwner;
	likesCount?: number;
	commentsCount?: number;
	createdAt: string;
	updatedAt?: string;
	isLiked?: boolean;
}

export interface GetTweetsResponse {
	docs: Tweet[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

export interface CreateTweetInput {
	content: string;
}
