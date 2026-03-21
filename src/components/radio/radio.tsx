import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { useId } from 'react'
import { tv } from 'tailwind-variants'

import type { RadioGroupProps, RadioItem, RadioProps } from './radio.types'

const styles = tv({
	slots: {
		description: 't:text-muted-foreground t:text-sm',
		indicator: 't:flex t:cursor-pointer t:items-center t:justify-center',
		label:
			't:cursor-pointer t:font-medium t:text-sm t:leading-none t:peer-disabled:cursor-not-allowed t:peer-disabled:opacity-70',
		root: 't:aspect-square t:h-4 t:w-4 t:rounded-full t:border t:border-input t:text-foreground t:ring-offset-background t:focus:outline-none t:focus-visible:ring-2 t:focus-visible:ring-ring t:focus-visible:ring-offset-2 t:disabled:cursor-not-allowed t:disabled:opacity-50',
		wrapper: 't:flex t:items-center t:gap-2',
	},
	variants: {
		bordered: {
			true: {
				wrapper: 't:cursor-pointer t:rounded-md t:border t:p-3',
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

function GroupItem({
	item,
	groupDisabled,
	bordered,
}: {
	item: RadioItem
	groupDisabled?: boolean
	bordered?: boolean
}) {
	const id = useId()
	const {
		root,
		indicator,
		wrapper,
		label: labelClass,
		description: descriptionClass,
	} = styles({
		bordered,
	})

	const content = (
		<>
			<RadioGroupPrimitive.Item
				className={root()}
				disabled={groupDisabled || item.disabled}
				id={id}
				value={item.value}
			>
				<RadioGroupPrimitive.Indicator className={indicator()}>
					<Circle className="t:h-2.5 t:w-2.5 t:fill-current t:text-current" />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
			{item.label && (
				<div className={bordered ? 't:pointer-events-none' : undefined}>
					<label
						className={labelClass()}
						htmlFor={bordered ? undefined : id}
					>
						{item.label}
					</label>
					{item.description && (
						<p className={descriptionClass()}>{item.description}</p>
					)}
				</div>
			)}
		</>
	)

	if (bordered) {
		return (
			<label
				className={wrapper()}
				htmlFor={id}
			>
				{content}
			</label>
		)
	}

	return <div className={wrapper()}>{content}</div>
}

function Root({
	label,
	description,
	value: radioValue,
	disabled,
	bordered,
	checked,
	defaultChecked,
	onChange,
}: RadioProps) {
	const id = useId()
	const {
		root,
		indicator,
		wrapper,
		label: labelClass,
		description: descriptionClass,
	} = styles({
		bordered,
	})
	const itemValue = radioValue ?? 'on'

	const content = (
		<>
			<RadioGroupPrimitive.Item
				className={root()}
				id={id}
				value={itemValue}
			>
				<RadioGroupPrimitive.Indicator className={indicator()}>
					<Circle className="t:h-2.5 t:w-2.5 t:fill-current t:text-current" />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
			{label && (
				<div className={bordered ? 't:pointer-events-none' : undefined}>
					<label
						className={labelClass()}
						htmlFor={bordered ? undefined : id}
					>
						{label}
					</label>
					{description && <p className={descriptionClass()}>{description}</p>}
				</div>
			)}
		</>
	)

	return (
		<RadioGroupPrimitive.Root
			defaultValue={defaultChecked ? itemValue : undefined}
			disabled={disabled}
			onValueChange={(val) => onChange?.(val === itemValue)}
			value={checked !== undefined ? (checked ? itemValue : '') : undefined}
		>
			{bordered ? (
				<label
					className={wrapper()}
					htmlFor={id}
				>
					{content}
				</label>
			) : (
				<div className={wrapper()}>{content}</div>
			)}
		</RadioGroupPrimitive.Root>
	)
}

function Group({
	items,
	variant,
	value,
	defaultValue,
	disabled,
	bordered,
	onChange,
}: RadioGroupProps) {
	const { root, item } = groupStyles({
		variant,
	})

	return (
		<RadioGroupPrimitive.Root
			className={root()}
			defaultValue={defaultValue}
			disabled={disabled}
			onValueChange={onChange}
			value={value}
		>
			{items.map((radioItem) => (
				<div
					className={item()}
					key={radioItem.value}
				>
					<GroupItem
						bordered={bordered}
						groupDisabled={disabled}
						item={radioItem}
					/>
				</div>
			))}
		</RadioGroupPrimitive.Root>
	)
}

export const Radio = Object.assign(Root, {
	Group,
})
