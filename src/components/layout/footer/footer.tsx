import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutFooterProps } from './footer.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const footerStyles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		root: 't:flex t:shrink-0 t:items-center t:px-2',
	},
	variants: {
		bordered: {
			true: {
				root: 't:border-border t:border-t',
			},
		},
		size: {
			lg: {
				root: 't:h-16',
			},
			md: {
				root: 't:h-14',
			},
			sm: {
				root: 't:h-10',
			},
		},
		sticky: {
			true: {
				root: 't:sticky t:bottom-0 t:z-10 t:bg-background',
			},
		},
	},
})

export function LayoutFooter({
	children,
	bordered,
	sticky,
	size,
}: PropsWithChildren<LayoutFooterProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.footer
	const { root } = footerStyles({
		bordered,
		size,
		sticky,
	})
	return (
		<footer className={cn(root(), config?.classNames?.root)}>{children}</footer>
	)
}
