import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ArrowClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallbackTitle?: string;
	fallbackDescription?: string;
	onReset?: () => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	errorMessage: string | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, errorMessage: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			errorMessage: error.message || 'An unexpected error occurred.',
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	private handleRetry = () => {
		this.setState({ hasError: false, errorMessage: null });
		this.props.onReset?.();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
					<WarningCircleIcon
						size={40}
						className="mb-3 text-[var(--destructive)]"
					/>
					<h2 className="text-lg font-semibold text-[var(--foreground)]">
						{this.props.fallbackTitle ?? 'Something went wrong'}
					</h2>
					<p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
						{this.props.fallbackDescription ??
							this.state.errorMessage ??
							'Unable to render this section. Please try again.'}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={this.handleRetry}
						className="mt-5 gap-2 rounded-full border-[var(--border)]"
					>
						<ArrowClockwiseIcon size={16} />
						<span>Try again</span>
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
