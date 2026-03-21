import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { CheckboxGroupProps, CheckboxProps } from './checkbox.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		description: 't:text-muted-foreground t:text-sm',
		icon: '',
		indicator: 't:grid t:place-content-center t:text-current',
		label:
			't:cursor-pointer t:font-medium t:text-sm t:leading-none t:peer-disabled:cursor-not-allowed t:peer-disabled:opacity-70',
		root: 't:peer t:grid t:shrink-0 t:cursor-pointer t:place-content-center t:rounded-sm t:border t:border-input t:ring-offset-background t:focus-visible:outline-none t:focus-visible:ring-2 t:focus-visible:ring-ring t:focus-visible:ring-offset-2 t:disabled:cursor-not-allowed t:disabled:opacity-50 t:data-[state=checked]:bg-primary t:data-[state=checked]:text-primary-foreground',
		wrapper: 't:flex t:items-center t:gap-2',
	},
	variants: {
		bordered: {
			true: {
				wrapper: 't:cursor-pointer t:rounded-md t:border t:p-3',
			},
		},
		size: {
			lg: {
				icon: 't:h-5 t:w-5',
				label: 't:text-base',
				root: 't:h-5 t:w-5',
			},
			md: {
				icon: 't:h-4 t:w-4',
				root: 't:h-4 t:w-4',
			},
			sm: {
				icon: 't:h-3 t:w-3',
				label: 't:text-xs',
				root: 't:h-3 t:w-3',
			},
		},
	},
})

const groupStyles = tv({
	defaultVariants: {
		variant: 'vertical',
	},
	slots: {
		item: '',
		root: 't:flex t:gap-2',
	},
	variants: {
		variant: {
			horizontal: {
				root: 't:flex-row t:flex-wrap',
			},
			vertical: {
				root: 't:flex-col',
			},
		},
	},
})

function Root({
	label,
	description,
	value,
	size,
	disabled,
	bordered,
	checked,
	defaultChecked,
	onChange,
}: CheckboxProps) {
	const id = useId()
	const state = useInternalState()
	const config = state?.components?.checkbox?.default
	const resolvedSize = size ?? config?.defaultProps?.size ?? 'md'

	const {
		wrapper,
		root,
		indicator,
		icon,
		label: labelClass,
		description: descriptionClass,
	} = styles({
		bordered,
		size: resolvedSize,
	})

	const content = (
		<>
			<CheckboxPrimitive.Root
				checked={checked}
				className={cn(root(), config?.classNames?.root)}
				defaultChecked={defaultChecked}
				disabled={disabled}
				id={id}
				onCheckedChange={(c) => onChange?.(c as boolean)}
				value={value}
			>
				<CheckboxPrimitive.Indicator
					className={cn(indicator(), config?.classNames?.indicator)}
				>
					<Check className={cn(icon(), config?.classNames?.icon)} />
				</CheckboxPrimitive.Indicator>
			</CheckboxPrimitive.Root>
			{label && (
				<div className={bordered ? 't:pointer-events-none' : undefined}>
					<label
						className={cn(labelClass(), config?.classNames?.label)}
						htmlFor={bordered ? undefined : id}
					>
						{label}
					</label>
					{description && (
						<p
							className={cn(
								descriptionClass(),
								config?.classNames?.description,
							)}
						>
							{description}
						</p>
					)}
				</div>
			)}
		</>
	)

	if (bordered) {
		return (
			<label
				className={cn(wrapper(), config?.classNames?.wrapper)}
				htmlFor={id}
			>
				{content}
			</label>
		)
	}

	return (
		<div className={cn(wrapper(), config?.classNames?.wrapper)}>{content}</div>
	)
}

function Group({
	items,
	value,
	defaultValue,
	disabled,
	variant,
	onChange,
}: CheckboxGroupProps) {
	const state = useInternalState()
	const config = state?.components?.checkbox?.group
	const resolvedVariant = variant ?? config?.defaultProps?.variant ?? 'vertical'

	const [internalValue, setInternalValue] = useState<string[]>(
		defaultValue ?? [],
	)
	const isControlled = value !== undefined
	const currentValue = isControlled ? value : internalValue

	const { root, item } = groupStyles({
		variant: resolvedVariant,
	})

	function handleChange(itemValue: string, checked: boolean) {
		const next = checked
			? [
					...currentValue,
					itemValue,
				]
			: currentValue.filter((v) => v !== itemValue)

		if (!isControlled) {
			setInternalValue(next)
		}
		onChange?.(next)
	}

	return (
		<div className={cn(root(), config?.classNames?.root)}>
			{items.map((checkboxItem) => (
				<div
					className={cn(item(), config?.classNames?.item)}
					key={checkboxItem.value}
				>
					<Root
						checked={currentValue.includes(checkboxItem.value)}
						disabled={disabled || checkboxItem.disabled}
						label={checkboxItem.label}
						onChange={(c) => handleChange(checkboxItem.value, c)}
						value={checkboxItem.value}
					/>
				</div>
			))}
		</div>
	)
}

export const Checkbox = Object.assign(Root, {
	Group,
})
