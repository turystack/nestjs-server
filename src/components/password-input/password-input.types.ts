import type { InputProps } from '@/components/input/input.types'

export type PasswordStrengthLevel =
	| 'very-weak'
	| 'weak'
	| 'medium'
	| 'strong'
	| 'very-strong'

export type PasswordInputProps = Omit<InputProps, 'type'> & {
	showStrength?: boolean
}
