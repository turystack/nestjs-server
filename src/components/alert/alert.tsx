import { X } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'
import { tv } from 'tailwind-variants'

import type {
	AlertActionProps,
	AlertDescriptionProps,
	AlertIconProps,
	AlertProps,
	AlertTitleProps,
} from './alert.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

type AlertContextValue = {
	variant: 'default' | 'destructive'
}

const AlertContext = createContext<AlertContextValue>({
	variant: 'default',
})

const styles = tv({
	defaultVariants: {
		variant: 'default',
	},
	slots: {
		action: `
      t:mt-2
    `,
		close: `
      t:absolute
      t:top-3
      t:right-3
      t:inline-flex
      t:h-6
      t:w-6
      t:cursor-pointer
      t:items-center
      t:justify-center
      t:rounded-md
      t:border-none
      t:bg-transparent
      t:opacity-70
      t:transition-all
      t:duration-200
      hover:t:opacity-100
      hover:t:bg-muted/50
    `,
		content: `
      t:flex
      t:flex-col
      t:gap-1
      t:flex-1
    `,
		description: `
      t:text-sm
      t:leading-relaxed
    `,
		icon: `
      t:flex
      t:items-start
      t:justify-center
      t:h-full
      t:pt-0.5
    `,
		root: `
      t:relative
      t:w-full
      t:rounded-lg
      t:border
      t:p-4
      t:transition-all
      t:duration-200
      t:ease-in-out
      t:flex
      t:gap-3
      t:items-stretch
    `,
		title: `
      t:font-medium
      t:leading-none
      t:tracking-tight
    `,
	},
	variants: {
		variant: {
			default: {
				close: 't:text-foreground',
				icon: 't:text-foreground',
				root: 't:bg-background t:text-foreground',
			},
			destructive: {
				close: 't:text-destructive',
				icon: 't:text-destructive',
				root: 't:border-destructive/50 t:text-destructive dark:t:border-destructive',
			},
		},
	},
})

function Root({
	variant,
	closable,
	onClose,
	children,
}: PropsWithChildren<AlertProps>) {
	const state = useInternalState()
	const config = state?.components?.alert?.default
	const translations = state?.translations?.alert

	const resolvedVariant = variant ?? config?.defaultProps?.variant ?? 'default'

	const [visible, setVisible] = useState(true)
	const [hiding, setHiding] = useState(false)

	const { root, close } = styles({
		variant: resolvedVariant,
	})

	function handleClose() {
		setHiding(true)
	}

	function handleTransitionEnd() {
		if (hiding) {
			setVisible(false)
			onClose?.()
		}
	}

	if (!visible) {
		return null
	}

	return (
		<AlertContext.Provider
			value={{
				variant: resolvedVariant,
			}}
		>
			<div
				className={cn(root(), config?.classNames?.root)}
				onTransitionEnd={handleTransitionEnd}
				role="alert"
				style={{
					opacity: hiding ? 0 : 1,
					transform: hiding ? 'translateY(-4px)' : 'translateY(0)',
				}}
			>
				{children}

				{closable && (
					<button
						aria-label={translations?.close}
						className={cn(close(), config?.classNames?.close)}
						onClick={handleClose}
						type="button"
					>
						<X className="t:h-4 t:w-4" />
					</button>
				)}
			</div>
		</AlertContext.Provider>
	)
}

function Icon({ children }: PropsWithChildren<AlertIconProps>) {
	const { variant } = useContext(AlertContext)
	const state = useInternalState()
	const config = state?.components?.alert?.icon

	const { icon } = styles({
		variant,
	})

	return (
		<span className={cn(icon(), config?.classNames?.root)}>{children}</span>
	)
}

function Content({ children }: PropsWithChildren) {
	const { content } = styles()
	const state = useInternalState()
	const config = state?.components?.alert?.default

	return (
		<div className={cn(content(), config?.classNames?.root)}>{children}</div>
	)
}

function Title({ children }: PropsWithChildren<AlertTitleProps>) {
	const { title } = styles()
	const state = useInternalState()
	const config = state?.components?.alert?.title

	return <h5 className={cn(title(), config?.classNames?.root)}>{children}</h5>
}

function Description({ children }: PropsWithChildren<AlertDescriptionProps>) {
	const { description } = styles()
	const state = useInternalState()
	const config = state?.components?.alert?.description

	return (
		<div className={cn(description(), config?.classNames?.root)}>
			{children}
		</div>
	)
}

function Action({ children }: PropsWithChildren<AlertActionProps>) {
	const { action } = styles()
	const state = useInternalState()
	const config = state?.components?.alert?.action

	return (
		<div className={cn(action(), config?.classNames?.root)}>{children}</div>
	)
}

export const Alert = Object.assign(Root, {
	Action,
	Content,
	Description,
	Icon,
	Title,
})
