// src/components/auth/LoginForm.tsx

import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { GoogleLogoIcon } from '@phosphor-icons/react';
import { Play, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/form';
import { PasswordInput } from '@/components/auth/PasswordInput';

import { loginSchema, type LoginFormValues } from '@/features/auth/validation';
import { useLogin } from '@/features/auth/mutations';
import { ROUTES } from '@/routes';

export function LoginForm() {
	const navigate = useNavigate();
	const login = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (values: LoginFormValues) => {
		try {
			await login.mutateAsync(values);

			toast.success('Welcome back!');

			navigate(ROUTES.HOME, {
				replace: true,
			});
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message ??
					'Login failed. Please try again.',
			);
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
			{/* 
              Main Card Container 
              Uses the design system's Card, Background, and Border tokens with a smooth entrance animation.
            */}
			<div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-card text-card-foreground rounded-[var(--radius)] shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-700 ease-out">
				{/* 
                  Left Column - Branding & Visuals
                  Hidden on smaller screens, prominent on desktop.
                */}
				<div className="relative hidden md:flex flex-col justify-between p-12 bg-secondary/30 border-r border-border overflow-hidden group">
					{/* Decorative Background Elements */}
					<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
					<div className="absolute -left-1/4 -bottom-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
					<div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[var(--youtube-red)]/5 rounded-full blur-3xl pointer-events-none" />

					{/* Logo Section */}
					<div className="relative z-10 flex items-center gap-3">
						<div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:-translate-y-1">
							<Play
								className="w-6 h-6 ml-1"
								fill="currentColor"
							/>
						</div>
						<span className="text-2xl font-bold tracking-tight">
							NovaPlay
						</span>
					</div>

					{/* Welcome Copy */}
					<div className="relative z-10 mt-auto animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150">
						<div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-background border border-border text-sm font-medium text-muted-foreground shadow-sm">
							<Sparkles className="w-4 h-4 text-warning" />
							<span>Version 2.0 is here</span>
						</div>
						<h2 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">
							Your universe <br />
							of{' '}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[var(--youtube-red)]">
								content.
							</span>
						</h2>
						<p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
							Discover, stream, and share the best moments. Sign
							in to continue your journey.
						</p>
					</div>
				</div>

				{/* 
                  Right Column - Login Form 
                */}
				<div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-card relative">
					{/* Mobile Branding (Visible only on small screens) */}
					<div className="md:hidden flex items-center gap-2 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
						<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground shadow-md">
							<Play
								className="w-5 h-5 ml-1"
								fill="currentColor"
							/>
						</div>
						<span className="text-xl font-bold tracking-tight">
							NovaPlay
						</span>
					</div>

					<div className="mx-auto w-full max-w-sm space-y-8">
						{/* Form Header */}
						<div className="space-y-2 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
							<h1 className="text-3xl font-bold tracking-tight text-foreground">
								Sign In
							</h1>
							<p className="text-sm text-muted-foreground">
								Enter your email and password to access your
								account.
							</p>
						</div>

						{/* Login Form */}
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
						>
							<div className="space-y-2 group/input">
								<Label
									htmlFor="email"
									className="transition-colors group-focus-within/input:text-primary"
								>
									Email
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									{...register('email')}
									className="h-11 bg-background transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
									disabled={login.isPending}
								/>
								{errors.email && (
									<FormMessage className="text-[var(--destructive)] animate-in slide-in-from-top-1 fade-in duration-200">
										{errors.email.message}
									</FormMessage>
								)}
							</div>
							<div className="space-y-2 group/input">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="password"
										className="transition-colors group-focus-within/input:text-primary"
									>
										Password
									</Label>
									<Link
										to="/forgot-password"
										className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
									>
										Forgot password?
									</Link>
								</div>
								<PasswordInput
									id="password"
									placeholder="••••••••"
									{...register('password')}
									className="h-11 bg-background transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
									disabled={login.isPending}
								/>
								{errors.password && (
									<FormMessage className="text-[var(--destructive)] animate-in slide-in-from-top-1 fade-in duration-200">
										{errors.password.message}
									</FormMessage>
								)}
							</div>

							<Button
								type="submit"
								className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2"
								disabled={login.isPending}
							>
								{login.isPending ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										Authenticating...
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						{/* Footer Links */}
						<div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
							<p className="text-sm text-muted-foreground">
								Don't have an account?{' '}
								<Link
									to={ROUTES.REGISTER ?? '/register'}
									className="font-semibold text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
								>
									Sign up now
								</Link>
							</p>
							<div className="mt-4">
								<Button
									variant="outline"
									className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
									onClick={() =>
										(window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`)
									}
								>
									<GoogleLogoIcon className="mr-2 h-5 w-5" />
									Sign in with Google
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
