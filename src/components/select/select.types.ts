import type { ComponentConfig } from '@/support/types'

export type SelectSlots =
	| 'root'
	| 'content'
	| 'option'
	| 'value'
	| 'search'
	| 'empty'
	| 'loader'
	| 'leftSection'
	| 'rightSection'

export type SelectMode = 'single' | 'multiple'

export type SelectInfiniteProps = {
	loadingMoreText?: string
	hasMore?: boolean
	loadingMore?: boolean
	onLoadMore?: () => void
}

export type SelectSize = 'sm' | 'md' | 'lg'

export type BaseSelectProps<T, O> = {
	options: T[]
	optionLabel: keyof T | ((option: T) => string)
	optionValue: keyof T | ((option: T) => O)
	optionGroup?: keyof T | ((option: T) => string)
	renderOption?: (option: T) => React.ReactNode
	renderValue?: (option: T) => React.ReactNode
	placeholder?: string
	searchable?: boolean
	searchPlaceholder?: string
	emptySection?: React.ReactNode
	leftSection?: React.ReactNode
	rightSection?: React.ReactNode
	infinite?: SelectInfiniteProps
	disabled?: boolean
	loading?: boolean
	size?: SelectSize
}

export type SelectSingleProps<T, I = string, O = I> = BaseSelectProps<T, O> & {
	mode: 'single'
	value?: I | null
	defaultValue?: I | null
	onChange?: (value: O | null) => void
}

export type SelectMultipleProps<T, I = string, O = I> = BaseSelectProps<
	T,
	O
> & {
	mode: 'multiple'
	value?: I[]
	defaultValue?: I[]
	onChange?: (value: O[]) => void
}

export type SelectProps<
	T,
	I = string,
	O = I,
	K extends SelectMode = SelectMode,
> = K extends 'single'
	? SelectSingleProps<T, I, O>
	: K extends 'multiple'
		? SelectMultipleProps<T, I, O>
		: never

export type SelectConfig = ComponentConfig<object, SelectSlots>
