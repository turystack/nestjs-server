import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { TooltipProps } from './tooltip.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		arrow:
			't:z-50 t:size-2.5 t:translate-y-[calc(-50%_-_2px)] t:rotate-45 t:rounded-[2px] t:bg-foreground t:fill-foreground',
		content:
			't:fade-in-0 t:zoom-in-95 data-[state=closed]:t:fade-out-0 data-[state=closed]:t:zoom-out-95 data-[side=bottom]:t:slide-in-from-top-2 data-[side=left]:t:slide-in-from-right-2 data-[side=right]:t:slide-in-from-left-2 data-[side=top]:t:slide-in-from-bottom-2 t:z-50 t:w-fit t:origin-(--radix-tooltip-content-transform-origin) t:animate-in t:text-balance t:rounded-md t:bg-foreground t:px-3 t:py-1.5 t:text-background t:text-xs data-[state=closed]:t:animate-out',
		root: '',
	},
})

export function Tooltip({
	content,
	side = 'top',
	sideOffset = 4,
	delayDuration,
	children,
}: PropsWithChildren<TooltipProps>) {
	const state = useInternalState()
	const config = state?.components?.tooltip
	const { content: contentClass, arrow: arrowClass } = styles()

	return (
		<TooltipPrimitive.Root delayDuration={delayDuration}>
			<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					className={cn(contentClass(), config?.classNames?.content)}
					side={side}
					sideOffset={sideOffset}
				>
					{content}
					<TooltipPrimitive.Arrow className={arrowClass()} />
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	)
}
