import type { InputProps } from '@/components/input/input.types'
import type { ComponentConfig } from '@/support/types'

export type CurrencyInputSlots =
	| 'root'
	| 'input'
	| 'leftSection'
	| 'rightSection'
	| 'loader'

export type Currency = 'brl' | 'usd' | 'eur'

export type CurrencyVariant = Currency | 'any'

export type CurrencyInputSingleValue = number | null
export type CurrencyInputRangeValue = {
	from?: number | null
	to?: number | null
}

type BaseCurrencyInputProps = Omit<
	InputProps,
	'value' | 'defaultValue' | 'onChange'
> & {
	variant?: CurrencyVariant
}

type SingleCurrencyInputProps = {
	mode?: 'single'
	value?: number | null
	defaultValue?: number | null
	onChange?: (value: number | null) => void
}

type RangeCurrencyInputProps = {
	mode: 'range'
	value?: CurrencyInputRangeValue
	defaultValue?: CurrencyInputRangeValue
	onChange?: (v: CurrencyInputRangeValue) => void
}

export type CurrencyInputProps = BaseCurrencyInputProps &
	(SingleCurrencyInputProps | RangeCurrencyInputProps)

export type CurrencyInputConfig = ComponentConfig<
	BaseCurrencyInputProps,
	CurrencyInputSlots
>
