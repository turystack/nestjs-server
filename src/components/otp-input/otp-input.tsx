import { OTPInput as OTPInputBase, OTPInputContext } from 'input-otp'
import { MinusIcon } from 'lucide-react'
import { useContext } from 'react'
import { tv } from 'tailwind-variants'

import type { OTPInputProps, OTPInputSize } from './otp-input.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		cell: 't:relative t:flex t:items-center t:justify-center t:border-input t:border-y t:border-r t:text-sm t:transition-all t:first:rounded-l-md t:first:border-l t:last:rounded-r-md',
		root: 't:flex t:items-center t:justify-center t:gap-1 t:has-[:disabled]:opacity-50',
	},
	variants: {
		active: {
			true: {
				cell: 't:z-10 t:ring-2 t:ring-ring t:ring-offset-background',
			},
		},
		size: {
			lg: {
				cell: 't:h-11 t:w-11',
			},
			md: {
				cell: 't:h-10 t:w-10',
			},
			sm: {
				cell: 't:h-9 t:w-9 t:text-xs',
			},
		},
	},
})

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className="t:flex t:w-4 t:shrink-0 t:items-center t:justify-center t:overflow-visible"
			{...props}
		>
			<MinusIcon size={16} />
		</div>
	)
}

function OTPSlot({ index, size }: { index: number; size: OTPInputSize }) {
	const inputOTPContext = useContext(OTPInputContext)
	const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

	const state = useInternalState()
	const config = state?.components?.otpInput
	const { cell } = styles({
		active: isActive,
		size,
	})

	return (
		<div className={cn(cell(), config?.classNames?.cell)}>
			{char}
			{hasFakeCaret && (
				<div className="t:pointer-events-none t:absolute t:inset-0 t:flex t:items-center t:justify-center">
					<div className="t:h-4 t:w-px t:animate-caret-blink t:bg-foreground t:duration-1000" />
				</div>
			)}
		</div>
	)
}

export function OTPInput({
	pattern = [],
	size,
	value,
	defaultValue,
	onChange,
}: OTPInputProps) {
	const state = useInternalState()
	const config = state?.components?.otpInput

	const resolvedPattern = pattern ?? config?.defaultProps?.pattern ?? []
	const resolvedSize: OTPInputSize = size ?? 'md'
	const maxLength = resolvedPattern.reduce((total, curr) => total + curr, 0)

	const { root } = styles({
		size: resolvedSize,
	})

	const handleChange = (val: string) => {
		onChange?.(val === '' ? null : val)
	}

	return (
		<OTPInputBase
			containerClassName={cn(root(), config?.classNames?.root)}
			defaultValue={defaultValue ?? undefined}
			maxLength={maxLength}
			onChange={handleChange}
			value={value ?? undefined}
		>
			{resolvedPattern.flatMap((length, index) => {
				const baseIndex = resolvedPattern
					.slice(0, index)
					.reduce((a, b) => a + b, 0)

				const elements: React.ReactNode[] = [
					<div
						className="t:flex t:items-center"
						key={`group-${baseIndex}`}
					>
						{Array.from({
							length,
						}).map((_, i) => (
							<OTPSlot
								index={baseIndex + i}
								key={`slot-${baseIndex + i}`}
								size={resolvedSize}
							/>
						))}
					</div>,
				]

				if (index < resolvedPattern.length - 1) {
					elements.push(<InputOTPSeparator key={`sep-${baseIndex}`} />)
				}

				return elements
			})}
		</OTPInputBase>
	)
}
