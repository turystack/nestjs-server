import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type {
	ModalBodyProps,
	ModalFooterProps,
	ModalHeaderDescriptionProps,
	ModalHeaderProps,
	ModalHeaderTitleProps,
	ModalProps,
} from './modal.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		close:
			't:cursor-pointer t:rounded-sm t:opacity-70 t:ring-offset-background t:transition-opacity t:hover:opacity-100 t:focus:outline-none t:focus:ring-2 t:focus:ring-ring t:focus:ring-offset-2 t:disabled:pointer-events-none t:data-[state=open]:bg-accent t:data-[state=open]:text-muted-foreground',
		content:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:fixed t:top-[50%] t:left-[50%] t:z-50 t:flex t:max-h-[90vh] t:w-full t:max-w-lg t:translate-x-[-50%] t:translate-y-[-50%] t:flex-col t:border t:bg-dialog t:shadow-lg t:duration-200 t:data-[state=closed]:animate-out t:data-[state=open]:animate-in t:sm:rounded-lg',
		overlay:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:fixed t:inset-0 t:z-50 t:bg-black/80 t:data-[state=closed]:animate-out t:data-[state=open]:animate-in',
		root: '',
	},
})

const headerStyles = tv({
	slots: {
		description: '',
		root: 't:flex t:shrink-0 t:items-center t:justify-between t:px-6 t:py-4',
		title: '',
	},
	variants: {
		bordered: {
			true: {
				root: 't:border-b',
			},
		},
	},
})

const headerTitleStyles = tv({
	slots: {
		root: 't:font-semibold t:text-lg t:leading-none t:tracking-tight',
	},
})

const headerDescriptionStyles = tv({
	slots: {
		root: 't:text-muted-foreground t:text-sm',
	},
})

const bodyStyles = tv({
	slots: {
		root: 't:flex-1 t:overflow-y-auto t:px-6 t:py-4',
	},
})

const footerStyles = tv({
	slots: {
		root: 't:flex t:shrink-0 t:flex-col-reverse t:gap-2 t:px-6 t:py-4 t:sm:flex-row t:sm:justify-end',
	},
	variants: {
		bordered: {
			true: {
				root: 't:border-t',
			},
		},
	},
})

function Root({ open, onChange, children }: PropsWithChildren<ModalProps>) {
	return (
		<DialogPrimitive.Root
			onOpenChange={onChange}
			open={open}
		>
			{children}
		</DialogPrimitive.Root>
	)
}

function Content({ children }: PropsWithChildren) {
	const state = useInternalState()
	const config = state?.components?.modal?.default
	const { overlay, content } = styles()

	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay
				className={cn(overlay(), config?.classNames?.overlay)}
			/>
			<DialogPrimitive.Content
				className={cn(content(), config?.classNames?.content)}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	)
}

function HeaderRoot({
	closable,
	bordered,
	children,
}: PropsWithChildren<ModalHeaderProps>) {
	const state = useInternalState()
	const config = state?.components?.modal?.header
	const modalConfig = state?.components?.modal?.default
	const { root } = headerStyles({
		bordered,
	})
	const { close } = styles()

	return (
		<div className={cn(root(), config?.classNames?.root)}>
			<div className="t:flex t:flex-col t:gap-1">{children}</div>
			{closable && (
				<DialogPrimitive.Close
					className={cn(close(), modalConfig?.classNames?.close)}
				>
					<X className="t:h-4 t:w-4" />
					<span className="t:sr-only">Close</span>
				</DialogPrimitive.Close>
			)}
		</div>
	)
}

function HeaderTitle({ children }: PropsWithChildren<ModalHeaderTitleProps>) {
	const state = useInternalState()
	const config = state?.components?.modal?.headerTitle
	const { root } = headerTitleStyles()

	return (
		<DialogPrimitive.Title className={cn(root(), config?.classNames?.root)}>
			{children}
		</DialogPrimitive.Title>
	)
}

function HeaderDescription({
	children,
}: PropsWithChildren<ModalHeaderDescriptionProps>) {
	const state = useInternalState()
	const config = state?.components?.modal?.headerDescription
	const { root } = headerDescriptionStyles()

	return (
		<DialogPrimitive.Description
			className={cn(root(), config?.classNames?.root)}
		>
			{children}
		</DialogPrimitive.Description>
	)
}

function Body({ children }: PropsWithChildren<ModalBodyProps>) {
	const state = useInternalState()
	const config = state?.components?.modal?.body
	const { root } = bodyStyles()

	return <div className={cn(root(), config?.classNames?.root)}>{children}</div>
}

function Footer({ bordered, children }: PropsWithChildren<ModalFooterProps>) {
	const state = useInternalState()
	const config = state?.components?.modal?.footer
	const { root } = footerStyles({
		bordered,
	})

	return <div className={cn(root(), config?.classNames?.root)}>{children}</div>
}

const Header = Object.assign(HeaderRoot, {
	Description: HeaderDescription,
	Title: HeaderTitle,
})

export const Modal = Object.assign(Root, {
	Body,
	Close: DialogPrimitive.Close,
	Content,
	Footer,
	Header,
	Trigger: DialogPrimitive.Trigger,
})
