import * as PopoverPrimitive from '@radix-ui/react-popover'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { PopoverProps } from './popover.types'

const styles = tv({
	slots: {
		content:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:data-[side=bottom]:slide-in-from-top-2 t:data-[side=left]:slide-in-from-right-2 t:data-[side=right]:slide-in-from-left-2 t:data-[side=top]:slide-in-from-bottom-2 t:z-50 t:w-72 t:rounded-md t:border t:bg-popover t:p-2 t:text-popover-foreground t:shadow-md t:outline-none t:data-[state=closed]:animate-out t:data-[state=open]:animate-in',
		root: '',
		trigger: '',
	},
})

export function Popover({
	content,
	side = 'bottom',
	sideOffset = 4,
	align = 'center',
	children,
}: PropsWithChildren<PopoverProps>) {
	const { content: contentClass } = styles()

	return (
		<PopoverPrimitive.Root>
			<PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					align={align}
					className={contentClass()}
					side={side}
					sideOffset={sideOffset}
				>
					{content}
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	)
}
