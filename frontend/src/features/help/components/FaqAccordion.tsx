import { CaretDownIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { HelpFaqItem } from '@/data/help-faqs';
import { cn } from '@/lib/utils';

interface FaqAccordionProps {
	items: HelpFaqItem[];
	openIds: ReadonlySet<string>;
	onToggle: (id: string) => void;
}

export function FaqAccordion({ items, openIds, onToggle }: FaqAccordionProps) {
	const reduceMotion = useReducedMotion();

	return (
		<div className="space-y-3">
			{items.map((item) => {
				const isOpen = openIds.has(item.id);
				const panelId = `faq-panel-${item.id}`;

				return (
					<article
						key={item.id}
						className="overflow-hidden rounded-2xl border border-border bg-card transition-colors"
					>
						<button
							type="button"
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={() => onToggle(item.id)}
							className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<div className="min-w-0 space-y-1">
								<span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
									{item.categoryLabel}
								</span>
								<h2 className="text-base font-semibold text-foreground">
									{item.question}
								</h2>
							</div>
							<CaretDownIcon
								size={18}
								className={cn(
									'shrink-0 text-muted-foreground transition-transform duration-150',
									isOpen && 'rotate-180 text-foreground',
								)}
							/>
						</button>

						<AnimatePresence initial={false}>
							{isOpen && (
								<motion.div
									id={panelId}
									initial={
										reduceMotion ? false : { height: 0, opacity: 0 }
									}
									animate={{ height: 'auto', opacity: 1 }}
									exit={
										reduceMotion
											? { opacity: 0 }
											: { height: 0, opacity: 0 }
									}
									transition={
										reduceMotion
											? { duration: 0 }
											: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
									}
									className="overflow-hidden"
								>
									<div className="space-y-3 border-t border-border/70 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
										<p>{item.answer}</p>

										{item.shortcuts && item.shortcuts.length > 0 && (
											<ul className="space-y-2 pt-1">
												{item.shortcuts.map((shortcut) => (
													<li
														key={shortcut.action}
														className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background px-3 py-2"
													>
														<span className="text-xs font-medium text-foreground">
															{shortcut.action}
														</span>
														<span className="flex items-center gap-1">
															{shortcut.keys.map((key) => (
																<kbd
																	key={key}
																	className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground"
																>
																	{key}
																</kbd>
															))}
														</span>
													</li>
												))}
											</ul>
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</article>
				);
			})}
		</div>
	);
}
