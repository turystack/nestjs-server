import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutMainProps } from './main.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const mainStyles = tv({
	slots: {
		root: 't:flex t:flex-1 t:flex-col t:overflow-hidden',
	},
})

export function LayoutMain({ children }: PropsWithChildren<LayoutMainProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.main
	const { root } = mainStyles()

	return <div className={cn(root(), config?.classNames?.root)}>{children}</div>
}
