import type { ElementType, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { TypographyProps } from './typography.types'

const styles = tv({
	base: '',
	defaultVariants: {
		variant: 'default',
	},
	variants: {
		size: {
			'2xl': 't:text-2xl',
			'3xl': 't:text-3xl',
			'4xl': 't:text-4xl',
			'5xl': 't:text-5xl',
			'6xl': 't:text-6xl',
			'7xl': 't:text-7xl',
			'8xl': 't:text-8xl',
			'9xl': 't:text-9xl',
			base: 't:text-base',
			lg: 't:text-lg',
			sm: 't:text-sm',
			xl: 't:text-xl',
			xs: 't:text-xs',
		},
		truncate: {
			true: 't:truncate t:block',
		},
		variant: {
			default: 't:text-foreground',
			muted: 't:text-muted-foreground',
		},
		weight: {
			black: 't:font-black',
			bold: 't:font-bold',
			extrabold: 't:font-extrabold',
			extralight: 't:font-extralight',
			light: 't:font-light',
			medium: 't:font-medium',
			normal: 't:font-normal',
			semibold: 't:font-semibold',
			thin: 't:font-thin',
		},
	},
})

export function Typography({
	component,
	size,
	variant,
	weight,
	truncate,
	children,
}: PropsWithChildren<TypographyProps>) {
	const Comp = (component ?? 'span') as ElementType

	return (
		<Comp
			className={styles({
				size,
				truncate,
				variant,
				weight,
			})}
		>
			{children}
		</Comp>
	)
}
