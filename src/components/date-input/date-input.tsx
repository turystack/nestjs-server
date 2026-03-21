import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { DateInputProps } from './date-input.types'

import { Input } from '@/components/input'
import { useInternalState } from '@/components/provider/provider.context'
import { Calendar } from '@/shadcn/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/popover'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		calendar: '',
		content: 't:w-auto t:p-2',
	},
})

export const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
	(
		{ value, defaultValue, placeholder, size, disabled, loading, onChange },
		_ref,
	) => {
		const state = useInternalState()
		const config = state?.components?.dateInput

		const resolvedDisabled = disabled ?? config?.defaultProps?.disabled ?? false

		const [open, setOpen] = useState(false)
		const [internalValue, setInternalValue] = useState<Date | null>(
			value ?? defaultValue ?? null,
		)

		const currentValue = value !== undefined ? value : internalValue

		const handleSelect = (date?: Date) => {
			const newValue = date ?? null
			setInternalValue(newValue)
			onChange?.(newValue)
			setOpen(false)
		}

		const formatDate = (date: Date | null | undefined) => {
			if (!date) {
				return placeholder ?? ''
			}
			return format(date, 'dd/MM/yyyy')
		}

		const { content, calendar } = styles()

		return (
			<Popover
				onOpenChange={setOpen}
				open={open}
			>
				<PopoverTrigger asChild>
					<Input
						className="t:cursor-pointer t:text-left"
						disabled={resolvedDisabled}
						leftSection={<CalendarIcon className="t:h-4 t:w-4" />}
						loading={loading}
						readOnly
						rootClassName="t:min-w-[160px]"
						size={size}
						value={formatDate(currentValue)}
					/>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					className={cn(content(), config?.classNames?.content)}
				>
					<Calendar
						className={cn(calendar(), config?.classNames?.calendar)}
						disabled={resolvedDisabled}
						mode="single"
						onSelect={handleSelect}
						selected={currentValue ?? undefined}
					/>
				</PopoverContent>
			</Popover>
		)
	},
)
