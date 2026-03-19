import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { TextareaProps } from './textarea.types'

import { styles as inputStyles } from '@/components/input/input.shared'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		counter:
			't:pointer-events-none t:absolute t:right-3 t:bottom-2 t:select-none t:text-muted-foreground t:text-xs',
		textarea: 't:h-auto t:resize-none t:overflow-hidden t:py-2',
	},
	variants: {
		hasCounter: {
			true: {
				textarea: 't:pb-5',
			},
		},
	},
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			rootClassName,
			value,
			defaultValue,
			placeholder,
			size,
			leftSection,
			rightSection,
			disabled,
			maxLength,
			onChange,
			...rest
		},
		ref,
	) => {
		const state = useInternalState()
		const config = state?.components?.textarea

		const resolvedSize = size ?? config?.defaultProps?.size ?? 'md'
		const hasLeft = !!leftSection
		const hasRight = !!rightSection

		const {
			root,
			input,
			leftSection: leftClass,
			rightSection: rightClass,
		} = inputStyles({
			hasLeft,
			hasRight,
			size: resolvedSize,
		})

		const { counter, textarea: textareaClass } = styles({
			hasCounter: !!maxLength,
		})
		const [internalValue, setInternalValue] = useState(defaultValue ?? '')
		const isControlled = value !== undefined
		const currentLength = isControlled
			? (value ?? '').length
			: internalValue.length

		function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
			const val = e.target.value
			if (!isControlled) {
				setInternalValue(val)
			}
			onChange?.(val === '' ? null : val)
			e.target.style.height = 'auto'
			e.target.style.height = `${e.target.scrollHeight}px`
		}

		return (
			<div
				className={cn(
					't:relative',
					root(),
					config?.classNames?.root,
					rootClassName,
				)}
			>
				{hasLeft && <div className={leftClass()}>{leftSection}</div>}
				<textarea
					{...rest}
					className={cn(input(), textareaClass(), className)}
					defaultValue={!isControlled ? (defaultValue ?? undefined) : undefined}
					disabled={disabled}
					maxLength={maxLength}
					onChange={handleChange}
					placeholder={placeholder}
					ref={ref}
					value={isControlled ? (value ?? undefined) : undefined}
				/>
				{hasRight && <div className={rightClass()}>{rightSection}</div>}
				{maxLength && (
					<span className={cn(counter(), config?.classNames?.counter)}>
						{currentLength} / {maxLength}
					</span>
				)}
			</div>
		)
	},
)
