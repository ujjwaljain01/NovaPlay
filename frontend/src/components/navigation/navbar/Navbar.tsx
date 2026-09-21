// components/Navbar.tsx
import React, { useState } from 'react';
import { Menu, Search, Bell, Play, Plus } from 'lucide-react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { UserMenu } from './UserMenu';

import { useIsMobile } from '@/hooks/useIsMobile';
import {
	useToggleSidebar,
	useToggleMobileSidebar,
} from '@/store/sidebar.selector';
import { useAuthStore } from '@/features/auth/auth.store';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme';

export function Navbar() {
	const [searchQuery, setSearchQuery] = useState('');

	const isMobile = useIsMobile();
	const toggleSidebar = useToggleSidebar();
	const toggleMobileSidebar = useToggleMobileSidebar();

	const { isAuthenticated } = useAuthStore();

	function handleSidebarToggle() {
		if (isMobile) {
			toggleMobileSidebar();
			return;
		}
		toggleSidebar();
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		console.log('Searching for:', searchQuery);
		// Routing logic here
	};

	return (
		<header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between ar(--navbar)] px-4 py-2 transition-colors">
			{/* Left: Sidebar Toggle & Brand */}
			<div className="flex w-1/4 items-center">
				<button
					onClick={handleSidebarToggle}
					className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--sidebar-hover)] focus:outline-none"
					aria-label="Toggle Sidebar"
				>
					<Menu className="h-5 w-5" />
				</button>

				<Link to="/" className="group flex items-center">
					{/* Logo Section */}
					<div className="relative z-10 flex items-center">
						<div className="flex items-center justify-center w-10 h-12 rounded-xl bg-primary text-primary-foreground transition-transform duration-500 group-hover:-translate-y-1">
							<Play className="w-6 h-6" fill="currentColor" />
						</div>
						<span className="text-2xl font-bold tracking-tight">
							NovaPlay
						</span>
					</div>
				</Link>
			</div>

			{/* Center: Modern Unified Search Pill (Solid Background) */}
			<div className="hidden flex-1 items-center justify-center px-4 md:flex">
				<form
					onSubmit={handleSearch}
					className="group relative flex w-full max-w-[560px] items-center rounded-full transition-all duration-300"
				>
					<div className="flex w-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary">
						<Input
							placeholder="Search"
							className="h-10 rounded-r-none rounded-l bg-background "
						/>
						<Button
							variant="secondary"
							className="rounded-l-none rounded-r h-10"
						>
							<MagnifyingGlassIcon size={20} />
						</Button>
					</div>
				</form>
			</div>

			{/* Right: Actions & User Profile */}
			<div className="flex w-1/4 items-center justify-end gap-2 sm:gap-3">
				{/* Mobile Search Trigger */}
				<button className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] md:hidden">
					<Search className="h-5 w-5" />
				</button>

				{isAuthenticated && (
					<div className="hidden items-center gap-2 sm:flex">
						<button
							className="flex items-center gap-2 rounded-r-none border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
							title="Create"
						>
							<Plus className="h-4 w-4" />
							<span>Create</span>
						</button>
					</div>
				)}

				<ThemeToggle />

				<div className="ml-1 border-l border-[var(--border)] pl-3">
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
