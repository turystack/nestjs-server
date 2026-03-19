import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type {
	Currency,
	CurrencyInputProps,
	CurrencyInputRangeValue,
} from './currency-input.types'

import { Button } from '@/components/button'
import { Input, type InputProps } from '@/components/input'
import { useInternalState } from '@/components/provider/provider.context'

const CURRENCY_LOCALE_MAP: Record<
	Currency,
	{
		locale: string
		code: string
	}
> = {
	brl: {
		code: 'BRL',
		locale: 'pt-BR',
	},
	eur: {
		code: 'EUR',
		locale: 'de-DE',
	},
	usd: {
		code: 'USD',
		locale: 'en-US',
	},
}

const formatCurrency = (
	value: number | null | undefined,
	currency: Currency,
) => {
	if (value === null || value === undefined) {
		return undefined
	}

	const { locale, code } = CURRENCY_LOCALE_MAP[currency]

	return Number(value).toLocaleString(locale, {
		currency: code,
		style: 'currency',
	})
}

const parseCurrency = (value: string | null): number | null => {
	if (value === null || value === '') {
		return null
	}

	const cleaned = value.replace(/[^\d]/g, '')

	if (!cleaned) {
		return 0
	}

	return Number.parseFloat(cleaned) / 100
}

const rangeStyles = tv({
	slots: {
		content:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:z-50 t:w-72 t:rounded-md t:border t:bg-popover t:p-4 t:shadow-md t:outline-none t:data-[state=closed]:animate-out t:data-[state=open]:animate-in',
		footer: 't:flex t:justify-end t:gap-2 t:pt-1',
		inputLabel: 't:text-muted-foreground t:text-xs',
		inputSection: 't:flex t:flex-col t:gap-1',
		inputsWrapper: 't:flex t:flex-col t:gap-3',
		trigger:
			't:flex t:h-10 t:w-full t:cursor-pointer t:items-center t:justify-between t:gap-2 t:rounded-md t:border t:border-input t:bg-background t:px-3 t:text-left t:text-sm t:ring-offset-background t:focus-visible:outline-none t:focus-visible:ring-2 t:focus-visible:ring-ring t:focus-visible:ring-offset-2 t:disabled:cursor-not-allowed t:disabled:opacity-50',
	},
})

const SingleCurrencyInput = forwardRef<
	HTMLInputElement,
	Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> & {
		value?: number | null
		defaultValue?: number | null
		onChange?: (value: number | null) => void
		currency: Currency
	}
>(({ value, defaultValue, onChange, currency, ...inputProps }, ref) => {
	const [internalValue, setInternalValue] = useState<number | null>(
		value ?? defaultValue ?? null,
	)

	const handleChange: InputProps['onChange'] = (val) => {
		const numericValue = parseCurrency(val)
		setInternalValue(numericValue)
		onChange?.(numericValue)
	}

	return (
		<Input
			{...inputProps}
			onChange={handleChange}
			ref={ref}
			value={formatCurrency(internalValue, currency)}
		/>
	)
})

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
	(props, ref) => {
		const state = useInternalState()
		const config = state?.components?.currencyInput

		const { currency, ...rest } = props

		const resolvedCurrency =
			currency ??
			(config?.defaultProps?.currency as Currency | undefined) ??
			'brl'

		if (rest.mode === 'range') {
			const {
				value: rangeValue,
				defaultValue: rangeDefaultValue,
				onChange: rangeOnChange,
				placeholder,
				disabled,
			} = rest

			return (
				<RangeCurrencyInput
					currency={resolvedCurrency}
					defaultValue={rangeDefaultValue}
					disabled={disabled}
					onChange={rangeOnChange}
					placeholder={placeholder}
					value={rangeValue}
				/>
			)
		}

		const { value, defaultValue, onChange, mode: _mode, ...inputProps } = rest

		return (
			<SingleCurrencyInput
				{...inputProps}
				currency={resolvedCurrency}
				defaultValue={defaultValue}
				onChange={onChange}
				ref={ref}
				value={value}
			/>
		)
	},
)

function RangeCurrencyInput({
	currency,
	value,
	defaultValue,
	onChange,
	placeholder,
	disabled,
}: {
	currency: Currency
	value?: CurrencyInputRangeValue
	defaultValue?: CurrencyInputRangeValue
	onChange?: (v: CurrencyInputRangeValue) => void
	placeholder?: string
	disabled?: boolean
}) {
	const state = useInternalState()
	const translations = state?.translations?.currencyInput

	const [open, setOpen] = useState(false)
	const [committed, setCommitted] = useState<CurrencyInputRangeValue>(
		value ?? defaultValue ?? {},
	)
	const [draft, setDraft] = useState<CurrencyInputRangeValue>(committed)

	const isControlled = value !== undefined
	const displayValue = isControlled ? (value ?? {}) : committed

	const { content, footer, inputLabel, inputSection, inputsWrapper, trigger } =
		rangeStyles()

	function handleOpen(next: boolean) {
		if (next) {
			setDraft(displayValue)
		}
		setOpen(next)
	}

	function handleConfirm() {
		if (!isControlled) {
			setCommitted(draft)
		}
		onChange?.(draft)
		setOpen(false)
	}

	const triggerLabel =
		displayValue.from != null || displayValue.to != null
			? `${formatCurrency(displayValue.from ?? null, currency) ?? '–'} – ${formatCurrency(displayValue.to ?? null, currency) ?? '–'}`
			: (placeholder ?? translations?.selectRange ?? 'Select range')

	return (
		<PopoverPrimitive.Root
			onOpenChange={handleOpen}
			open={open}
		>
			<PopoverPrimitive.Trigger asChild>
				<button
					className={trigger()}
					disabled={disabled}
					type="button"
				>
					<span>{triggerLabel}</span>
					<ChevronDown className="t:h-4 t:w-4 t:shrink-0 t:text-muted-foreground" />
				</button>
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					className={content()}
					sideOffset={4}
				>
					<div className={inputsWrapper()}>
						<div className={inputSection()}>
							<span className={inputLabel()}>
								{translations?.from ?? 'From'}
							</span>
							<Input
								onChange={(val) =>
									setDraft((d) => ({
										...d,
										from: parseCurrency(val),
									}))
								}
								placeholder={formatCurrency(0, currency)}
								value={formatCurrency(draft.from ?? null, currency)}
							/>
						</div>
						<div className={inputSection()}>
							<span className={inputLabel()}>{translations?.to ?? 'To'}</span>
							<Input
								onChange={(val) =>
									setDraft((d) => ({
										...d,
										to: parseCurrency(val),
									}))
								}
								placeholder={formatCurrency(0, currency)}
								value={formatCurrency(draft.to ?? null, currency)}
							/>
						</div>
						<div className={footer()}>
							<Button
								onClick={() => setOpen(false)}
								size="sm"
								variant="outline"
							>
								{translations?.cancel ?? 'Cancel'}
							</Button>
							<Button
								onClick={handleConfirm}
								size="sm"
							>
								{translations?.confirm ?? 'Confirm'}
							</Button>
						</div>
					</div>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	)
}
