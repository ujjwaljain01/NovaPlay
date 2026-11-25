import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const HASHTAG_TOKEN_PATTERN = /(^|[\s(])(#[a-zA-Z0-9_]{1,50})/g;

interface HashtagTextProps {
	text: string;
}

export function HashtagText({ text }: HashtagTextProps) {
	if (!text) return null;

	const nodes: ReactNode[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(HASHTAG_TOKEN_PATTERN)) {
		const matchIndex = match.index ?? 0;
		const prefix = match[1] ?? '';
		const fullToken = match[2] ?? '';
		const tokenStart = matchIndex + prefix.length;

		if (tokenStart > lastIndex) {
			nodes.push(text.slice(lastIndex, tokenStart));
		}

		const normalizedTag = fullToken.slice(1).toLowerCase();
		nodes.push(
			<Link
				key={`${tokenStart}-${normalizedTag}`}
				to={`/search?tag=${encodeURIComponent(normalizedTag)}`}
				onClick={(e) => e.stopPropagation()}
				className="font-medium text-primary transition-colors hover:underline"
			>
				{fullToken}
			</Link>,
		);

		lastIndex = tokenStart + fullToken.length;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return <>{nodes}</>;
}
