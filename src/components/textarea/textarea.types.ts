import type { InputSize } from '@/components/input/input.types'
import type { ComponentConfig } from '@/support/types'

export type TextareaSlots = 'root' | 'counter'

export type TextareaProps = Omit<
	React.TextareaHTMLAttributes<HTMLTextAreaElement>,
	'onChange' | 'size' | 'value' | 'defaultValue'
> & {
	value?: string | null
	defaultValue?: string | null
	size?: InputSize
	rootClassName?: string
	leftSection?: React.ReactNode
	rightSection?: React.ReactNode
	onChange?: (value: string | null) => void
	maxLength?: number
}

export type TextareaConfig = ComponentConfig<TextareaProps, TextareaSlots>
