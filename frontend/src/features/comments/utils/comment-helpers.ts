const EDIT_TOLERANCE_MS = 1000;
const LEADING_MENTION_REGEX = /^@([a-zA-Z0-9_.-]+)(?=\s|$)/;

export interface LeadingMentionParts {
	mentionUsername: string | null;
	mentionToken: string;
	rest: string;
}

export function isCommentEdited(comment: {
	isEdited?: boolean;
	createdAt: string;
	updatedAt?: string;
}): boolean {
	if (typeof comment.isEdited === 'boolean') {
		return comment.isEdited;
	}
	if (!comment.updatedAt) return false;
	const createdMs = new Date(comment.createdAt).getTime();
	const updatedMs = new Date(comment.updatedAt).getTime();
	if (Number.isNaN(createdMs) || Number.isNaN(updatedMs)) return false;
	return updatedMs - createdMs > EDIT_TOLERANCE_MS;
}

export function parseLeadingMention(content: string): LeadingMentionParts {
	const match = LEADING_MENTION_REGEX.exec(content);
	if (!match) {
		return { mentionUsername: null, mentionToken: '', rest: content };
	}
	const mentionToken = match[0];
	return {
		mentionUsername: match[1],
		mentionToken,
		rest: content.slice(mentionToken.length),
	};
}
