import { forwardRef } from 'react'

import { useDebounceFn } from '@/hooks'

import { styles } from './input.shared'
import type { InputProps } from './input.types'

import { Loader } from '@/components/loader'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			rootClassName,
			style,
			type,
			value,
			defaultValue,
			placeholder,
			size,
			leftSection,
			rightSection,
			debounce,
			disabled,
			loading,
			onClick,
			readOnly,
			onChange,
			...rest
		},
		ref,
	) => {
		const state = useInternalState()
		const config = state?.components?.input

		const resolvedSize = size ?? config?.defaultProps?.size ?? 'md'
		const resolvedDebounce = debounce ?? config?.defaultProps?.debounce ?? false
		const resolvedDisabled = disabled ?? config?.defaultProps?.disabled ?? false
		const resolvedLoading = loading ?? config?.defaultProps?.loading ?? false

		const hasLeft = !!leftSection
		const hasRight = !!rightSection || resolvedLoading

		const {
			root,
			input,
			leftSection: leftSectionClass,
			rightSection: rightSectionClass,
			loader,
		} = styles({
			hasLeft,
			hasRight,
			size: resolvedSize,
		})

		const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const val = event.target.value
			onChange?.(val === '' ? null : val)
		}

		const handleDebouncedChange = useDebounceFn(handleChange)

		return (
			<div
				className={cn(root(), config?.classNames?.root, rootClassName)}
				onClick={onClick}
			>
				{hasLeft && (
					<div
						className={cn(leftSectionClass(), config?.classNames?.leftSection)}
					>
						{leftSection}
					</div>
				)}

				<input
					{...rest}
					className={cn(input(), config?.classNames?.input, className)}
					defaultValue={
						resolvedDebounce ? (value ?? defaultValue ?? undefined) : undefined
					}
					disabled={resolvedDisabled}
					onChange={resolvedDebounce ? handleDebouncedChange : handleChange}
					placeholder={placeholder}
					readOnly={readOnly}
					ref={ref}
					style={style}
					type={type ?? 'text'}
					value={!resolvedDebounce ? (value ?? undefined) : undefined}
				/>

				{hasRight && (
					<div
						className={cn(
							rightSectionClass(),
							config?.classNames?.rightSection,
						)}
					>
						{resolvedLoading && (
							<div className={cn(loader(), config?.classNames?.loader)}>
								<Loader size="sm" />
							</div>
						)}

						{rightSection}
					</div>
				)}
			</div>
		)
	},
)
