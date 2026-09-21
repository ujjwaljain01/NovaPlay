interface Props {
	content: string;
}

export function TweetContent({ content }: Props) {
	return (
		<p className="line-clamp-6 text-sm leading-relaxed text-foreground/90 whitespace-pre-line break-words">
			{content}
		</p>
	);
}
