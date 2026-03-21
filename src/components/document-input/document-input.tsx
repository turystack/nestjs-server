import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { DocumentInputProps } from './document-input.types'

import { MaskInput } from '@/components/mask-input'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const CPF_MASK = '000.000.000-00'
const CNPJ_MASK = '00.000.000/0000-00'

function getMask(type: 'cpf' | 'cnpj'): string {
	return type === 'cpf' ? CPF_MASK : CNPJ_MASK
}

function getLabel(type: 'cpf' | 'cnpj'): string {
	return type === 'cpf' ? 'CPF' : 'CNPJ'
}

const styles = tv({
	slots: {
		root: 't:relative t:flex t:w-full',
		typeSelector:
			't:flex t:h-10 t:cursor-pointer t:items-center t:gap-1 t:rounded-l-md t:border t:border-input t:border-r-0 t:bg-transparent t:px-3 t:text-sm t:transition-colors t:hover:bg-accent t:disabled:pointer-events-none t:disabled:opacity-50',
	},
})

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(
	(
		{ variant, value, defaultValue, onChange, placeholder, disabled, ...rest },
		ref,
	) => {
		const state = useInternalState()
		const config = state?.components?.documentInput

		const [activeType, setActiveType] = useState<'cpf' | 'cnpj'>(
			(value?.type !== 'any' ? value?.type : undefined) ??
				(defaultValue?.type !== 'any' ? defaultValue?.type : undefined) ??
				(variant === 'any' ? 'cpf' : variant),
		)

		const resolvedType: 'cpf' | 'cnpj' =
			variant === 'any' ? activeType : variant
		const mask = getMask(resolvedType)

		function handleChange(raw: string | null) {
			if (!raw) {
				onChange?.(null)
				return
			}
			onChange?.({
				number: raw,
				type: resolvedType,
			})
		}

		if (variant !== 'any') {
			return (
				<MaskInput
					{...rest}
					defaultValue={defaultValue?.number}
					disabled={disabled}
					mask={mask}
					onChange={handleChange}
					placeholder={
						placeholder ??
						(variant === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00')
					}
					ref={ref}
					value={value?.number}
				/>
			)
		}

		const { root, typeSelector } = styles()

		return (
			<div className={cn(root(), config?.classNames?.root)}>
				<DropdownMenuPrimitive.Root>
					<DropdownMenuPrimitive.Trigger asChild>
						<button
							className={cn(typeSelector(), config?.classNames?.typeSelector)}
							disabled={disabled}
							type="button"
						>
							<span>{getLabel(activeType)}</span>
							<ChevronDown className="t:size-4 t:text-muted-foreground" />
						</button>
					</DropdownMenuPrimitive.Trigger>

					<DropdownMenuPrimitive.Portal>
						<DropdownMenuPrimitive.Content
							align="start"
							className="t:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:data-[side=bottom]:slide-in-from-top-2 t:data-[side=left]:slide-in-from-right-2 t:data-[side=right]:slide-in-from-left-2 t:data-[side=top]:slide-in-from-bottom-2 t:z-50 t:min-w-[8rem] t:overflow-hidden t:rounded-md t:border t:bg-popover t:p-1 t:text-popover-foreground t:shadow-md t:data-[state=closed]:animate-out t:data-[state=open]:animate-in"
							sideOffset={4}
						>
							{(
								[
									'cpf',
									'cnpj',
								] as const
							).map((type) => (
								<DropdownMenuPrimitive.Item
									className="t:relative t:flex t:cursor-default t:select-none t:items-center t:rounded-sm t:px-2 t:py-1.5 t:text-sm t:outline-none t:transition-colors t:focus:bg-accent t:focus:text-accent-foreground t:data-[disabled]:pointer-events-none t:data-[disabled]:opacity-50"
									key={type}
									onClick={() => setActiveType(type)}
								>
									{getLabel(type)}
								</DropdownMenuPrimitive.Item>
							))}
						</DropdownMenuPrimitive.Content>
					</DropdownMenuPrimitive.Portal>
				</DropdownMenuPrimitive.Root>

				<div className="t:flex-1">
					<MaskInput
						{...rest}
						className="t:rounded-l-none"
						defaultValue={defaultValue?.number}
						disabled={disabled}
						key={resolvedType}
						mask={mask}
						onChange={handleChange}
						placeholder={placeholder ?? 'CPF ou CNPJ'}
						ref={ref}
						value={value?.number}
					/>
				</div>
			</div>
		)
	},
)
