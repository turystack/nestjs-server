import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { FlexProps } from './flex.types'

const styles = tv({
	base: 't:flex t:w-full',
	defaultVariants: {
		align: 'start',
		direction: 'row',
		gap: 'none',
		justify: 'start',
		wrap: 'nowrap',
	},
	variants: {
		align: {
			baseline: 't:items-baseline',
			center: 't:items-center',
			end: 't:items-end',
			start: 't:items-start',
			stretch: 't:items-stretch',
		},
		direction: {
			col: 't:flex-col',
			'col-reverse': 't:flex-col-reverse',
			row: 't:flex-row',
			'row-reverse': 't:flex-row-reverse',
		},
		gap: {
			lg: 't:gap-6',
			md: 't:gap-4',
			none: 't:gap-0',
			sm: 't:gap-2',
			xl: 't:gap-8',
			xs: 't:gap-1',
		},
		inline: {
			true: 't:inline-flex',
		},
		justify: {
			around: 't:justify-around',
			between: 't:justify-between',
			center: 't:justify-center',
			end: 't:justify-end',
			evenly: 't:justify-evenly',
			start: 't:justify-start',
		},
		minHeight: {
			lg: 't:min-h-[800px]',
			md: 't:min-h-[600px]',
			screen: 't:min-h-screen',
			sm: 't:min-h-[400px]',
		},
		wrap: {
			nowrap: 't:flex-nowrap',
			wrap: 't:flex-wrap',
			'wrap-reverse': 't:flex-wrap-reverse',
		},
	},
})

export function Flex({
	direction,
	justify,
	align,
	gap,
	wrap,
	inline,
	minHeight,
	children,
}: PropsWithChildren<FlexProps>) {
	return (
		<div
			className={styles({
				align,
				direction,
				gap,
				inline,
				justify,
				minHeight,
				wrap,
			})}
		>
			{children}
		</div>
	)
}
