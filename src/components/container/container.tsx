import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { ContainerProps } from './container.types'

const styles = tv({
	base: 't:w-full',
	defaultVariants: {
		centered: true,
	},
	variants: {
		centered: {
			true: 't:mx-auto',
		},
		maxWidth: {
			'2xl': 't:max-w-2xl',
			full: '',
			lg: 't:max-w-lg',
			md: 't:max-w-md',
			sm: 't:max-w-sm',
			xl: 't:max-w-xl',
			xs: 't:max-w-xs',
		},
		textAlign: {
			center: 't:text-center',
			left: 't:text-left',
			right: 't:text-right',
		},
	},
})

export function Container({
	centered,
	maxWidth,
	textAlign,
	children,
}: PropsWithChildren<ContainerProps>) {
	return (
		<div
			className={styles({
				centered,
				maxWidth,
				textAlign,
			})}
		>
			{children}
		</div>
	)
}
