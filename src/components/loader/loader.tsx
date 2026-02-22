import { Loader2 } from 'lucide-react'
import { tv } from 'tailwind-variants'

import type { LoaderProps } from './loader.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const loader = tv({
	base: 't:animate-spin',
	defaultVariants: {
		size: 'md',
	},
	variants: {
		size: {
			lg: 't:size-8',
			md: 't:size-6',
			sm: 't:size-4',
		},
	},
})

export function Loader({ size }: LoaderProps) {
	const state = useInternalState()

	const classNames = state?.components?.loader?.classNames
	const defaults = state?.components?.loader?.defaultProps

	const resolved = {
		size: size ?? defaults?.size ?? 'md',
	}

	return (
		<Loader2
			className={cn(
				loader({
					size: resolved.size,
				}),
				classNames?.root,
			)}
		/>
	)
}
