import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { ButtonProps } from './button.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const button = tv({
	base: 't:inline-flex t:items-center t:justify-center t:gap-2 t:whitespace-nowrap t:rounded-md t:font-medium t:text-sm t:ring-offset-background t:transition-colors t:focus-visible:outline-none t:focus-visible:ring-2 t:focus-visible:ring-ring t:focus-visible:ring-offset-2 t:disabled:pointer-events-none t:disabled:opacity-50 t:[&_svg]:pointer-events-none t:[&_svg]:size-4 t:[&_svg]:shrink-0',
	defaultVariants: {
		size: 'md',
		variant: 'default',
	},
	variants: {
		block: {
			true: 't:w-full',
		},
		size: {
			'icon-lg': 't:h-10 t:w-10',
			'icon-md': 't:h-9 t:w-9',
			'icon-sm': 't:h-8 t:w-8',
			lg: 't:h-11 t:rounded-md t:px-8',
			md: 't:h-10 t:px-4 t:py-2',
			sm: 't:h-9 t:rounded-md t:px-3',
		},
		variant: {
			dashed:
				't:border-2 t:border-input t:border-dashed t:bg-background t:hover:bg-accent t:hover:text-accent-foreground',
			default: 't:bg-primary t:text-primary-foreground t:hover:bg-primary/90',
			destructive:
				't:bg-destructive t:text-destructive-foreground t:hover:bg-destructive/90',
			ghost: 't:hover:bg-accent t:hover:text-accent-foreground',
			link: 't:text-primary t:underline-offset-4 t:hover:underline',
			outline:
				't:border t:border-input t:bg-background t:hover:bg-accent t:hover:text-accent-foreground',
			secondary:
				't:bg-secondary t:text-secondary-foreground t:hover:bg-secondary/80',
		},
	},
})

export function Button(props: PropsWithChildren<ButtonProps>) {
	const {
		form,
		type = 'button',
		size,
		variant,
		leftSection,
		rightSection,
		block,
		loading,
		disabled,
		asChild,
		onClick,
		children,
	} = props

	const state = useInternalState()

	const classNames = state?.components?.button?.classNames
	const defaults = state?.components?.button?.defaultProps

	const resolved = {
		asChild: asChild ?? defaults?.asChild ?? false,
		block: block ?? defaults?.block ?? false,
		disabled: disabled ?? defaults?.disabled ?? false,
		form: form ?? defaults?.form ?? undefined,
		loading: loading ?? defaults?.loading ?? false,
		size: size ?? defaults?.size ?? 'md',
		type: type ?? defaults?.type ?? 'button',
		variant: variant ?? defaults?.variant ?? 'default',
	}

	const Comp = resolved.asChild ? Slot : 'button'
	const isDisabled = resolved.disabled || resolved.loading

	return (
		<Comp
			className={cn(
				button({
					block: resolved.block,
					size: resolved.size,
					variant: resolved.variant,
				}),
				classNames?.root,
			)}
			disabled={isDisabled}
			form={resolved.form}
			onClick={onClick}
			type={resolved.type}
		>
			{resolved.loading ? (
				<div className={classNames?.loading}>
					<Loader2 className="t:animate-spin" />
				</div>
			) : (
				<>
					{leftSection && (
						<div className={classNames?.leftSection}>{leftSection}</div>
					)}

					{children}

					{rightSection && (
						<div className={classNames?.rightSection}>{rightSection}</div>
					)}
				</>
			)}
		</Comp>
	)
}
