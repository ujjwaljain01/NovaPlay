// src/components/auth/RegisterForm.tsx

import { useNavigate, Link } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
	CaretRightIcon,
	CaretLeftIcon,
	PlayIcon,
	GoogleLogoIcon,
} from '@phosphor-icons/react';

import type { Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
	registerSchema,
	type RegisterFormValues,
} from '@/features/auth/validation';
import { useRegister } from '@/features/auth/mutations';
import { ROUTES } from '@/routes';

import { RegisterStepper } from './RegisterStepper';
import { useRegisterStepper } from './useRegisterStepper';
import { AccountStep, ProfileStep, SecurityStep } from './steps';
import { RegisterStep } from './register-steps';

const PLAYFUL_TEXTS = {
	[RegisterStep.ACCOUNT]: {
		title: "Let's Get Started! 🚀",
		description:
			"Every great journey begins with a single step. We just need a few basic details to set up your profile. Don't worry, no spam allowed.",
	},
	[RegisterStep.SECURITY]: {
		title: 'Lock It Down 🔒',
		description:
			'Create a fortress for your account. Pick a strong password to keep the digital goblins and hackers at bay.',
	},
	[RegisterStep.PROFILE]: {
		title: 'Make It Yours 🎨',
		description:
			'Put a face to the name! Upload an avatar and cover image so everyone knows how awesome you are.',
	},
};

// 1. Add the ': Variants' type to your stepVariants
const stepVariants: Variants = {
	initial: (direction: number) => ({
		x: direction > 0 ? '10%' : '-10%',
		opacity: 0,
	}),
	animate: {
		x: 0,
		opacity: 1,
		// TypeScript now knows this is a valid 4-number tuple
		transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
	},
	exit: (direction: number) => ({
		x: direction < 0 ? '10%' : '-10%',
		opacity: 0,
		transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
	}),
};

// 2. You can optionally type textVariants too for consistency
const textVariants: Variants = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
	exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

export function RegisterForm() {
	const navigate = useNavigate();
	const registerMutation = useRegister();
	const stepper = useRegisterStepper();

	const methods = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		mode: 'onChange',
		defaultValues: {
			email: '',
			username: '',
			password: '',
			confirmPassword: '',
		},
	});

	const submit = async (values: RegisterFormValues) => {
		try {
			await registerMutation.mutateAsync(values);
			toast.success('Account created successfully. Welcome aboard! 🎉');
			navigate(ROUTES.LOGIN, { replace: true });
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message ??
					'Registration failed. Please try again.',
			);
		}
	};

	const handleNext = async () => {
		// Validate specific fields based on current step before advancing
		let fieldsToValidate: (keyof RegisterFormValues)[] = [];

		if (stepper.currentStep === RegisterStep.ACCOUNT) {
			fieldsToValidate = ['email', 'username'];
		} else if (stepper.currentStep === RegisterStep.SECURITY) {
			fieldsToValidate = ['password', 'confirmPassword'];
		}

		const isStepValid = await methods.trigger(fieldsToValidate);
		if (isStepValid) stepper.nextStep();
	};

	const currentPlayfulText =
		PLAYFUL_TEXTS[stepper.currentStep as keyof typeof PLAYFUL_TEXTS];

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary overflow-hidden">
			<div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-card text-card-foreground rounded-[var(--radius)] shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-700 ease-out">
				{/* Left Column - Dynamic Branding */}
				<div className="relative hidden md:flex flex-col justify-between p-12 bg-secondary/30 border-r border-border overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
					<div className="absolute -left-1/4 -bottom-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

					<div className="relative z-10 flex items-center gap-3">
						<div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
							<PlayIcon className="w-6 h-6 ml-1" weight="fill" />
						</div>
						<span className="text-2xl font-bold tracking-tight">
							NovaPlay
						</span>
					</div>

					<div className="relative z-10 mt-auto min-h-[160px]">
						<AnimatePresence mode="wait">
							<motion.div
								key={stepper.currentStep}
								variants={textVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								className="space-y-4"
							>
								<h2 className="text-3xl font-extrabold tracking-tight">
									{currentPlayfulText.title}
								</h2>
								<p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
									{currentPlayfulText.description}
								</p>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

				{/* Right Column - Multi-step Form */}
				<div className="p-8 sm:p-12 sm:pb-8 flex flex-col bg-card relative min-h-[500px]">
					<div className="mb-8">
						<RegisterStepper currentStep={stepper.currentStep} />
					</div>

					<FormProvider {...methods}>
						<form
							onSubmit={methods.handleSubmit(submit)}
							className="flex-1 flex flex-col"
						>
							<div className="flex-1 relative">
								<AnimatePresence
									custom={stepper.direction}
									mode="wait"
								>
									<motion.div
										key={stepper.currentStep}
										custom={stepper.direction}
										variants={stepVariants}
										initial="initial"
										animate="animate"
										exit="exit"
										className="absolute inset-0 w-full h-full"
									>
										{stepper.currentStep ===
											RegisterStep.ACCOUNT && (
											<AccountStep />
										)}
										{stepper.currentStep ===
											RegisterStep.SECURITY && (
											<SecurityStep />
										)}
										{stepper.currentStep ===
											RegisterStep.PROFILE && (
											<ProfileStep />
										)}
									</motion.div>
								</AnimatePresence>
							</div>

							{/* Navigation Buttons */}
							<div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
								<Button
									type="button"
									variant="ghost"
									onClick={stepper.prevStep}
									disabled={
										stepper.isFirstStep ||
										registerMutation.isPending
									}
									className="gap-2"
								>
									<CaretLeftIcon weight="bold" /> Back
								</Button>

								{stepper.isLastStep ? (
									<Button
										type="submit"
										disabled={registerMutation.isPending}
										className="shadow-lg shadow-primary/25 min-w-[120px]"
									>
										{registerMutation.isPending
											? 'Creating...'
											: 'Create Account'}
									</Button>
								) : (
									<Button
										type="button"
										onClick={handleNext}
										className="gap-2 shadow-lg shadow-primary/25 min-w-[120px]"
									>
										Next <CaretRightIcon weight="bold" />
									</Button>
								)}
							</div>
						</form>
					</FormProvider>
					{/* Footer Links */}
					<div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 pt-6">
						<p className="text-sm text-muted-foreground">
							Already have an account?{' '}
							<Link
								to={ROUTES.LOGIN ?? '/login'}
								className="font-semibold text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
							>
								LogIn now
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
								Sign up with Google
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
