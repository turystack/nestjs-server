import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { BoxProps } from './box.types'

const styles = tv({
	base: '',
	variants: {
		bg: {
			background: 't:bg-background',
			card: 't:bg-card',
			muted: 't:bg-muted',
		},
		grow: {
			true: 't:flex-1',
		},
		minHeight: {
			lg: 't:min-h-[800px]',
			md: 't:min-h-[600px]',
			screen: 't:min-h-screen',
			sm: 't:min-h-[400px]',
		},
		overflow: {
			auto: 't:overflow-auto',
			hidden: 't:overflow-hidden',
			visible: 't:overflow-visible',
		},
		padding: {
			lg: 't:p-8',
			md: 't:p-4',
			none: 't:p-0',
			sm: 't:p-2',
			xl: 't:p-12',
			xs: 't:p-1',
		},
		paddingX: {
			lg: 't:px-8',
			md: 't:px-4',
			none: 't:px-0',
			sm: 't:px-2',
			xl: 't:px-12',
			xs: 't:px-1',
		},
		paddingY: {
			lg: 't:py-8',
			md: 't:py-4',
			none: 't:py-0',
			sm: 't:py-2',
			xl: 't:py-12',
			xs: 't:py-1',
		},
		position: {
			absolute: 't:absolute',
			relative: 't:relative',
			static: 't:static',
		},
		rounded: {
			full: 't:rounded-full',
			lg: 't:rounded-lg',
			md: 't:rounded-md',
			none: 't:rounded-none',
			sm: 't:rounded-sm',
			xl: 't:rounded-xl',
		},
		textAlign: {
			center: 't:text-center',
			left: 't:text-left',
			right: 't:text-right',
		},
		width: {
			auto: 't:w-auto',
			full: 't:w-full',
		},
	},
})

export function Box({
	bg,
	grow,
	minHeight,
	overflow,
	padding,
	paddingX,
	paddingY,
	position,
	rounded,
	textAlign,
	width,
	children,
}: PropsWithChildren<BoxProps>) {
	return (
		<div
			className={styles({
				bg,
				grow,
				minHeight,
				overflow,
				padding,
				paddingX,
				paddingY,
				position,
				rounded,
				textAlign,
				width,
			})}
		>
			{children}
		</div>
	)
}
