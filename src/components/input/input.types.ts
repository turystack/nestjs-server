import type { ComponentConfig } from '@/support/types'

export type InputType = 'text' | 'password'

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
	type?: InputType
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
