import { Slot } from '@radix-ui/react-slot'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { BadgeProps } from './badge.types'

import { Loader } from '@/components/loader'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	defaultVariants: {
		variant: 'default',
	},
	slots: {
		root: 't:relative t:inline-flex t:cursor-pointer t:items-center t:rounded-full t:border t:px-2.5 t:py-0.5 t:font-semibold t:text-xs t:transition-colors t:focus:outline-none t:focus:ring-2 t:focus:ring-ring t:focus:ring-offset-2',
	},
	variants: {
		align: {
			center: {
				root: 't:justify-center',
			},
			end: {
				root: 't:justify-end',
			},
			start: {
				root: 't:justify-start',
			},
		},
		block: {
			true: {
				root: 't:flex t:w-full',
			},
		},
		variant: {
			default: {
				root: 't:border-transparent t:bg-primary t:text-primary-foreground t:hover:bg-primary/80',
			},
			destructive: {
				root: 't:border-transparent t:bg-destructive t:text-destructive-foreground t:hover:bg-destructive/80',
			},
			outline: {
				root: 't:text-foreground',
			},
			secondary: {
				root: 't:border-transparent t:bg-secondary t:text-secondary-foreground t:hover:bg-secondary/80',
			},
		},
	},
})

export function Badge({
	variant,
	align,
	block,
	loading,
	asChild,
	onClick,
	children,
}: PropsWithChildren<BadgeProps>) {
	const state = useInternalState()
	const config = state?.components?.badge

	const resolvedVariant = variant ?? config?.defaultProps?.variant ?? 'default'
	const resolvedAlign = align ?? config?.defaultProps?.align ?? undefined
	const resolvedBlock = block ?? config?.defaultProps?.block ?? false
	const resolvedLoading = loading ?? config?.defaultProps?.loading ?? false
	const resolvedAsChild = asChild ?? config?.defaultProps?.asChild ?? false

	const { root } = styles({
		align: resolvedAlign,
		block: resolvedBlock,
		variant: resolvedVariant,
	})

	const Comp = resolvedAsChild ? Slot : 'div'

	return (
		<Comp
			className={cn(root(), config?.classNames?.root)}
			onClick={onClick}
		>
			{resolvedLoading && (
				<span className="t:absolute t:inset-0 t:flex t:items-center t:justify-center">
					<Loader size="sm" />
				</span>
			)}
			<span className={resolvedLoading ? 't:invisible' : undefined}>
				{children}
			</span>
		</Comp>
	)
}
