import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState } from 'react'

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

		const resolvedType = type ?? config?.defaultProps?.type ?? 'text'
		const resolvedSize = size ?? config?.defaultProps?.size ?? 'md'
		const resolvedDebounce = debounce ?? config?.defaultProps?.debounce ?? false
		const resolvedDisabled = disabled ?? config?.defaultProps?.disabled ?? false
		const resolvedLoading = loading ?? config?.defaultProps?.loading ?? false

		const [showPassword, setShowPassword] = useState(false)
		const isPassword = resolvedType === 'password'
		const inputType = isPassword && showPassword ? 'text' : resolvedType
		const hasLeft = !!leftSection
		const hasRight = !!rightSection || resolvedLoading || isPassword

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

		const togglePasswordVisibility = () => {
			setShowPassword((prev) => !prev)
		}

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
					type={inputType}
					value={!resolvedDebounce ? (value ?? undefined) : undefined}
				/>

				{(hasRight || resolvedLoading) && (
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

						{isPassword && (
							<button
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								className="t:pointer-events-auto t:flex t:items-center t:justify-center t:text-muted-foreground t:transition-colors hover:t:text-foreground"
								onClick={togglePasswordVisibility}
								type="button"
							>
								{showPassword ? (
									<EyeOff className="t:size-4" />
								) : (
									<Eye className="t:size-4" />
								)}
							</button>
						)}
					</div>
				)}
			</div>
		)
	},
)
