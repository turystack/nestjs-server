import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutContentProps } from './content.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const contentStyles = tv({
	slots: {
		inner: '',
		root: 't:flex-1 t:overflow-auto',
	},
	variants: {
		maxWidth: {
			lg: {
				inner: 't:mx-auto t:w-full t:max-w-6xl',
			},
			md: {
				inner: 't:mx-auto t:h-full t:w-full t:max-w-4xl',
			},
			sm: {
				inner: 't:mx-auto t:w-full t:max-w-2xl',
			},
		},
		padding: {
			lg: {
				inner: 't:p-8',
			},
			md: {
				inner: 't:p-4',
			},
			sm: {
				inner: 't:p-2',
			},
		},
		paddingHorizontal: {
			lg: {
				inner: 't:px-8',
			},
			md: {
				inner: 't:px-4',
			},
			sm: {
				inner: 't:px-2',
			},
		},
		paddingVertical: {
			lg: {
				inner: 't:py-8',
			},
			md: {
				inner: 't:py-4',
			},
			sm: {
				inner: 't:py-2',
			},
		},
	},
})

export function LayoutContent({
	children,
	padding,
	paddingHorizontal,
	paddingVertical,
	maxWidth,
}: PropsWithChildren<LayoutContentProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.content
	const { root, inner } = contentStyles({
		maxWidth,
		padding,
		paddingHorizontal,
		paddingVertical,
	})
	return (
		<main className={cn(root(), config?.classNames?.root)}>
			<div className={cn(inner(), config?.classNames?.inner)}>{children}</div>
		</main>
	)
}
