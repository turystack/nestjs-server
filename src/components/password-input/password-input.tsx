import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type {
	PasswordInputProps,
	PasswordStrengthLevel,
} from './password-input.types'

import { Input } from '@/components/input'

const STRENGTH_RULES = [
	(v: string) => v.length >= 8,
	(v: string) => /[A-Z]/.test(v),
	(v: string) => /[a-z]/.test(v),
	(v: string) => /[0-9]/.test(v),
	(v: string) => /[^A-Za-z0-9]/.test(v),
]

function getStrength(value: string): {
	score: number
	level: PasswordStrengthLevel
} {
	const score = STRENGTH_RULES.filter((rule) => rule(value)).length

	if (score <= 1) return { score, level: 'very-weak' }
	if (score === 2) return { score, level: 'weak' }
	if (score === 3) return { score, level: 'medium' }
	if (score === 4) return { score, level: 'strong' }
	return { score, level: 'very-strong' }
}

const styles = tv({
	slots: {
		bar: 't:h-1.5 t:flex-1 t:rounded-full t:transition-colors',
		barWrapper: 't:flex t:gap-1 t:pt-2',
		label: 't:text-xs t:pt-1',
		root: 't:w-full',
	},
})

const barColors: Record<PasswordStrengthLevel, string> = {
	'very-weak': 't:bg-destructive',
	weak: 't:bg-orange-500',
	medium: 't:bg-yellow-500',
	strong: 't:bg-green-500',
	'very-strong': 't:bg-green-700',
}

const labelColors: Record<PasswordStrengthLevel, string> = {
	'very-weak': 't:text-destructive',
	weak: 't:text-orange-500',
	medium: 't:text-yellow-500',
	strong: 't:text-green-500',
	'very-strong': 't:text-green-700',
}

const LABELS: Record<PasswordStrengthLevel, string> = {
	'very-weak': 'Very weak',
	weak: 'Weak',
	medium: 'Medium',
	strong: 'Strong',
	'very-strong': 'Very strong',
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ showStrength = true, value, onChange, ...props }, ref) => {
		const [internalValue, setInternalValue] = useState('')
		const currentValue =
			typeof value === 'string' ? value : (internalValue ?? '')

		const handleChange = (val: string | null) => {
			setInternalValue(val ?? '')
			onChange?.(val)
		}

		const { root, barWrapper, bar, label } = styles()

		const strength = showStrength && currentValue
			? getStrength(currentValue)
			: null

		return (
			<div className={root()}>
				<Input
					{...props}
					onChange={handleChange}
					ref={ref}
					type="password"
					value={value}
				/>
				{showStrength && strength && (
					<>
						<div className={barWrapper()}>
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									className={`${bar()} ${i < strength.score ? barColors[strength.level] : 't:bg-muted'}`}
									key={i}
								/>
							))}
						</div>
						<p className={`${label()} ${labelColors[strength.level]}`}>
							{LABELS[strength.level]}
						</p>
					</>
				)}
			</div>
		)
	},
)
