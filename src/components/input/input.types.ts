import type { ComponentConfig } from '@/support/types'

export type InputSlots =
	| 'root'
	| 'input'
	| 'leftSection'
	| 'rightSection'
	| 'loader'

export type InputSize = 'sm' | 'md' | 'lg'

export type InputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'onChange' | 'size' | 'value' | 'defaultValue' | 'type'
> & {
	/** @internal Use only for internal composition (e.g. PasswordInput). Not intended as a public API. */
	type?: 'text' | 'password'
	value?: string | null
	defaultValue?: string | null
	size?: InputSize
	rootClassName?: string
	leftSection?: React.ReactNode
	rightSection?: React.ReactNode
	debounce?: boolean
	loading?: boolean
	onChange?: (value: string | null) => void
}

export type InputConfig = ComponentConfig<InputProps, InputSlots>
