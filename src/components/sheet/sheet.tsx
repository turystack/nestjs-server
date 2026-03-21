'use client'

import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type {
	SheetBodyProps,
	SheetDescriptionProps,
	SheetFooterProps,
	SheetHeaderProps,
	SheetProps,
	SheetTitleProps,
} from './sheet.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	defaultVariants: {
		side: 'right',
	},
	slots: {
		body: 't:flex-1 t:overflow-y-auto t:p-6',
		close:
			't:absolute t:top-4 t:right-4 t:cursor-pointer t:rounded-sm t:opacity-70 t:ring-offset-background t:transition-opacity t:hover:opacity-100 t:focus:outline-none t:focus:ring-2 t:focus:ring-ring t:focus:ring-offset-2 t:disabled:pointer-events-none t:data-[state=open]:bg-secondary',
		closeIcon: 't:h-4 t:w-4',
		closeInline:
			't:cursor-pointer t:rounded-sm t:opacity-70 t:ring-offset-background t:transition-opacity t:hover:opacity-100 t:focus:outline-none t:focus:ring-2 t:focus:ring-ring t:focus:ring-offset-2 t:disabled:pointer-events-none t:data-[state=open]:bg-secondary',
		content:
			't:fixed t:z-50 t:flex t:flex-col t:overflow-hidden t:bg-sheet t:shadow-lg t:transition t:ease-in-out t:data-[state=closed]:animate-out t:data-[state=open]:animate-in t:data-[state=closed]:duration-300 t:data-[state=open]:duration-500',
		description: 't:text-muted-foreground t:text-sm',
		footer:
			't:sticky t:bottom-0 t:z-10 t:flex t:flex-col-reverse t:bg-sheet t:p-6 t:sm:flex-row t:sm:justify-end t:sm:space-x-2',
		header:
			't:sticky t:top-0 t:z-10 t:flex t:shrink-0 t:items-center t:justify-between t:bg-sheet t:p-6',
		overlay:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:fixed t:inset-0 t:z-50 t:bg-black/80 t:data-[state=closed]:animate-out t:data-[state=open]:animate-in',
		title: 't:font-semibold t:text-foreground t:text-lg',
	},
	variants: {
		bordered: {
			true: {
				footer: 't:border-t',
				header: 't:border-b',
			},
		},
		side: {
			bottom: {
				content:
					't:data-[state=closed]:slide-out-to-bottom t:data-[state=open]:slide-in-from-bottom t:inset-x-0 t:bottom-0 t:border-t',
			},
			left: {
				content:
					't:data-[state=closed]:slide-out-to-left t:data-[state=open]:slide-in-from-left t:inset-y-0 t:left-0 t:h-full t:w-3/4 t:border-r t:sm:max-w-sm',
			},
			right: {
				content:
					't:data-[state=closed]:slide-out-to-right t:data-[state=open]:slide-in-from-right t:inset-y-0 t:right-0 t:h-full t:w-3/4 t:border-l t:sm:max-w-sm',
			},
			top: {
				content:
					't:data-[state=closed]:slide-out-to-top t:data-[state=open]:slide-in-from-top t:inset-x-0 t:top-0 t:border-b',
			},
		},
	},
})

function Root({
	open,
	side = 'right',
	onChange,
	children,
}: PropsWithChildren<SheetProps>) {
	const state = useInternalState()
	const config = state?.components?.sheet?.default

	const { overlay, content, close, closeIcon } = styles({
		side,
	})

	return (
		<SheetPrimitive.Root
			onOpenChange={onChange}
			open={open}
		>
			<SheetPrimitive.Portal>
				<SheetPrimitive.Overlay
					className={cn(overlay(), config?.classNames?.overlay)}
				/>
				<SheetPrimitive.Content
					className={cn(content(), config?.classNames?.content)}
				>
					{children}
					<SheetPrimitive.Close
						className={cn(close(), config?.classNames?.close)}
					>
						<X className={closeIcon()} />
						<span className="t:sr-only">Close</span>
					</SheetPrimitive.Close>
				</SheetPrimitive.Content>
			</SheetPrimitive.Portal>
		</SheetPrimitive.Root>
	)
}

function Header({
	bordered,
	closable,
	children,
}: PropsWithChildren<SheetHeaderProps>) {
	const state = useInternalState()
	const config = state?.components?.sheet?.header

	const { header, closeInline, closeIcon } = styles({
		bordered,
	})

	return (
		<div className={cn(header(), config?.classNames?.root)}>
			<div className="t:flex t:flex-col t:gap-1">{children}</div>
			{closable && (
				<SheetPrimitive.Close className={closeInline()}>
					<X className={closeIcon()} />
					<span className="t:sr-only">Close</span>
				</SheetPrimitive.Close>
			)}
		</div>
	)
}

function Body({ children }: PropsWithChildren<SheetBodyProps>) {
	const state = useInternalState()
	const config = state?.components?.sheet?.body

	const { body } = styles()

	return <div className={cn(body(), config?.classNames?.root)}>{children}</div>
}

function Footer({ bordered, children }: PropsWithChildren<SheetFooterProps>) {
	const state = useInternalState()
	const config = state?.components?.sheet?.footer

	const { footer } = styles({
		bordered,
	})

	return (
		<div className={cn(footer(), config?.classNames?.root)}>{children}</div>
	)
}

function Title({ children }: PropsWithChildren<SheetTitleProps>) {
	const state = useInternalState()
	const config = state?.components?.sheet?.title

	const { title } = styles()

	return (
		<SheetPrimitive.Title className={cn(title(), config?.classNames?.root)}>
			{children}
		</SheetPrimitive.Title>
	)
}

function Description({ children }: PropsWithChildren<SheetDescriptionProps>) {
	const state = useInternalState()
	const config = state?.components?.sheet?.description

	const { description } = styles()

	return (
		<SheetPrimitive.Description
			className={cn(description(), config?.classNames?.root)}
		>
			{children}
		</SheetPrimitive.Description>
	)
}

export const Sheet = Object.assign(Root, {
	Body,
	Close: SheetPrimitive.Close,
	Description,
	Footer,
	Header,
	Title,
	Trigger: SheetPrimitive.Trigger,
})
