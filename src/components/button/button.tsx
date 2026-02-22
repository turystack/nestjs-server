import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { ButtonProps } from './button.types'

import { useTuryStack } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const button = tv({
	base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	defaultVariants: {
		size: 'md',
		variant: 'default',
	},
	variants: {
		block: {
			true: 'w-full',
		},
		size: {
			icon: 'h-10 w-10',
			lg: 'h-11 rounded-md px-8',
			md: 'h-10 px-4 py-2',
			sm: 'h-9 rounded-md px-3',
		},
		variant: {
			dashed:
				'border-2 border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground',
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			destructive:
				'bg-destructive text-destructive-foreground hover:bg-destructive/90',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline',
			outline:
				'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
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

	const state = useTuryStack()

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
					<Loader2 className="animate-spin" />
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
