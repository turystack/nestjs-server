import { forwardRef } from 'react'
import { IMaskInput } from 'react-imask'

import type { MaskInputProps } from './mask-input.types'

import { styles } from '@/components/input/input.shared'
import { Loader } from '@/components/loader'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

export const MaskInput = forwardRef<HTMLInputElement, MaskInputProps>(
	(
		{
			mask,
			value,
			defaultValue,
			placeholder,
			size,
			leftSection,
			rightSection,
			disabled,
			loading,
			className,
			onChange,
		},
		ref,
	) => {
		const state = useInternalState()
		const config = state?.components?.maskInput

		const resolvedSize = size ?? config?.defaultProps?.size ?? 'md'
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

		const handleAccept = (val: string) => {
			onChange?.(val === '' ? null : val)
		}

		return (
			<div className={cn(root(), config?.classNames?.root)}>
				{hasLeft && (
					<div
						className={cn(leftSectionClass(), config?.classNames?.leftSection)}
					>
						{leftSection}
					</div>
				)}

				<IMaskInput
					className={cn(input(), config?.classNames?.input, className)}
					disabled={resolvedDisabled}
					inputRef={ref}
					mask={
						Array.isArray(mask)
							? mask.map((m) => ({
									mask: m,
								}))
							: [
									{
										mask,
									},
								]
					}
					onAccept={handleAccept}
					placeholder={placeholder}
					value={value ?? defaultValue ?? undefined}
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
					</div>
				)}
			</div>
		)
	},
)
