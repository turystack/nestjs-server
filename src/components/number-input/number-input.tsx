import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type {
	NumberInputProps,
	NumberInputRangeValue,
} from './number-input.types'

import { Button } from '@/components/button/button'
import { styles as inputStyles } from '@/components/input/input.shared'
import { cn } from '@/support/utils'

const stepperStyles = tv({
	slots: {
		button:
			't:flex t:cursor-pointer t:items-center t:justify-center t:self-stretch t:px-2 t:text-muted-foreground t:transition-colors t:hover:text-foreground t:disabled:pointer-events-none t:disabled:opacity-50',
		divider: 't:w-px t:self-stretch t:bg-border',
		input: '',
		root: 't:flex t:w-full t:items-stretch t:overflow-hidden t:rounded-md t:border t:border-input t:bg-input/30',
	},
})

const rangeStyles = tv({
	slots: {
		cancel: '',
		confirm: '',
		content:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:z-50 t:w-72 t:rounded-md t:border t:bg-popover t:p-4 t:shadow-md t:outline-none t:data-[state=closed]:animate-out t:data-[state=open]:animate-in',
		footer: 't:flex t:justify-end t:gap-2 t:pt-1',
		inputLabel: 't:text-muted-foreground t:text-xs',
		inputSection: 't:flex t:flex-col t:gap-1',
		inputsWrapper: 't:flex t:flex-col t:gap-3',
		trigger:
			't:flex t:h-10 t:w-full t:cursor-pointer t:items-center t:justify-between t:gap-2 t:rounded-md t:border t:border-input t:bg-input/30 t:px-3 t:text-left t:text-sm t:ring-offset-background t:focus-visible:outline-none t:focus-visible:ring-2 t:focus-visible:ring-ring t:focus-visible:ring-offset-2 t:disabled:cursor-not-allowed t:disabled:opacity-50',
	},
})

function StepperInput({
	value,
	disabled,
	placeholder,
	step,
	inputClass,
	onChange,
}: {
	value: number | undefined
	disabled?: boolean
	placeholder?: string
	step: number
	inputClass: string
	onChange: (next: number) => void
}) {
	const { root: stepRoot, button, divider } = stepperStyles()
	const current = value ?? 0

	return (
		<div className={stepRoot()}>
			<button
				className={button()}
				disabled={disabled}
				onClick={() => onChange(current - step)}
				type="button"
			>
				<Minus className="t:h-3 t:w-3" />
			</button>
			<span className={divider()} />
			<input
				className={inputClass}
				disabled={disabled}
				inputMode="numeric"
				onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
				placeholder={placeholder}
				type="text"
				value={value ?? ''}
			/>
			<span className={divider()} />
			<button
				className={button()}
				disabled={disabled}
				onClick={() => onChange(current + step)}
				type="button"
			>
				<Plus className="t:h-3 t:w-3" />
			</button>
		</div>
	)
}

function SingleNumberInput({
	step,
	size,
	disabled,
	placeholder,
	value,
	defaultValue,
	onChange,
	inputRef,
}: {
	step: number
	size: 'sm' | 'md' | 'lg'
	disabled?: boolean
	placeholder?: string
	value?: number
	defaultValue?: number
	onChange?: (value: number) => void
	inputRef: React.Ref<HTMLInputElement>
}) {
	const [internal, setInternal] = useState<number>(defaultValue ?? 0)
	const isControlled = value !== undefined
	const current = isControlled ? (value ?? 0) : internal

	const { input } = inputStyles({
		hasLeft: false,
		hasRight: false,
		size,
	})
	const inputClass = cn(
		input(),
		't:flex-1 t:border-0 t:rounded-none t:text-center t:focus-visible:ring-0 t:focus-visible:ring-offset-0',
	)

	function update(next: number) {
		if (!isControlled) {
			setInternal(next)
		}
		onChange?.(next)
	}

	const { root: stepRoot, button, divider } = stepperStyles()

	return (
		<div className={stepRoot()}>
			<button
				className={button()}
				disabled={disabled}
				onClick={() => update(current - step)}
				type="button"
			>
				<Minus className="t:h-3 t:w-3" />
			</button>
			<span className={divider()} />
			<input
				className={inputClass}
				disabled={disabled}
				inputMode="numeric"
				onChange={(e) => update(parseFloat(e.target.value) || 0)}
				placeholder={placeholder}
				ref={inputRef}
				type="text"
				value={current}
			/>
			<span className={divider()} />
			<button
				className={button()}
				disabled={disabled}
				onClick={() => update(current + step)}
				type="button"
			>
				<Plus className="t:h-3 t:w-3" />
			</button>
		</div>
	)
}

function RangeNumberInput({
	step,
	size,
	disabled,
	placeholder,
	value,
	defaultValue,
	onChange,
}: {
	step: number
	size: 'sm' | 'md' | 'lg'
	disabled?: boolean
	placeholder?: string
	value?: NumberInputRangeValue
	defaultValue?: NumberInputRangeValue
	onChange?: (value: NumberInputRangeValue) => void
}) {
	const [open, setOpen] = useState(false)
	const [committed, setCommitted] = useState<NumberInputRangeValue>(
		defaultValue ?? {},
	)
	const [draft, setDraft] = useState<NumberInputRangeValue>(committed)

	const isControlled = value !== undefined
	const displayValue = isControlled ? (value ?? {}) : committed

	const { input } = inputStyles({
		hasLeft: false,
		hasRight: false,
		size,
	})
	const inputClass = cn(
		input(),
		't:flex-1 t:border-0 t:rounded-none t:text-center t:focus-visible:ring-0 t:focus-visible:ring-offset-0',
	)

	const { content, footer, inputLabel, inputSection, inputsWrapper, trigger } =
		rangeStyles()

	function handleOpen(nextOpen: boolean) {
		if (nextOpen) {
			setDraft(displayValue)
		}
		setOpen(nextOpen)
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
			? `${displayValue.from ?? '–'} até ${displayValue.to ?? '–'}`
			: (placeholder ?? 'Selecionar intervalo')

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
							<span className={inputLabel()}>De</span>
							<StepperInput
								disabled={disabled}
								inputClass={inputClass}
								onChange={(v) =>
									setDraft((d) => ({
										...d,
										from: v,
									}))
								}
								step={step}
								value={draft.from}
							/>
						</div>
						<div className={inputSection()}>
							<span className={inputLabel()}>Até</span>
							<StepperInput
								disabled={disabled}
								inputClass={inputClass}
								onChange={(v) =>
									setDraft((d) => ({
										...d,
										to: v,
									}))
								}
								step={step}
								value={draft.to}
							/>
						</div>
						<div className={footer()}>
							<Button
								onClick={() => setOpen(false)}
								size="sm"
								variant="outline"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleConfirm}
								size="sm"
							>
								Confirmar
							</Button>
						</div>
					</div>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	)
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
	({ step = 1, size, disabled, placeholder, ...props }, ref) => {
		const resolvedSize = size ?? 'md'

		if (props.mode === 'single') {
			return (
				<SingleNumberInput
					defaultValue={props.defaultValue}
					disabled={disabled}
					inputRef={ref}
					onChange={props.onChange}
					placeholder={placeholder}
					size={resolvedSize}
					step={step}
					value={props.value}
				/>
			)
		}

		return (
			<RangeNumberInput
				defaultValue={props.defaultValue}
				disabled={disabled}
				onChange={props.onChange}
				placeholder={placeholder}
				size={resolvedSize}
				step={step}
				value={props.value}
			/>
		)
	},
)
