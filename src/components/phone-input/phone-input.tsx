import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Search } from 'lucide-react'
import { forwardRef, useMemo, useState } from 'react'
import { tv } from 'tailwind-variants'

import { COUNTRIES, type Country } from './phone-input.data'
import type { PhoneInputProps } from './phone-input.types'

import { MaskInput, type MaskInputProps } from '@/components/mask-input'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const DEFAULT_COUNTRY_CODE = 'BR'

const styles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		countrySelector:
			't:flex t:cursor-pointer t:items-center t:gap-1 t:rounded-l-md t:border t:border-input t:border-r-0 t:bg-transparent t:px-3 t:text-sm t:transition-colors t:hover:bg-accent t:disabled:pointer-events-none t:disabled:opacity-50',
		input: '',
		loader: '',
		rightSection: '',
		root: 't:relative t:flex t:w-full',
	},
	variants: {
		size: {
			lg: {
				countrySelector: 't:h-11',
			},
			md: {
				countrySelector: 't:h-10',
			},
			sm: {
				countrySelector: 't:h-9',
			},
		},
	},
})

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, defaultValue, onChange, disabled, ...props }, ref) => {
		const state = useInternalState()
		const config = state?.components?.phoneInput
		const translations = state?.translations?.phoneInput

		const countries: Country[] = useMemo(() => {
			const displayNames = new Intl.DisplayNames(
				[
					'en',
				],
				{
					type: 'region',
				},
			)

			return COUNTRIES.map((country) => ({
				...country,
				name: displayNames.of(country.code) ?? country.code,
			})).sort((a, b) => a.name.localeCompare(b.name))
		}, [])

		const initialValue = value ?? defaultValue
		const [selectedCountry, setSelectedCountry] = useState<Country | null>(
			initialValue
				? (countries.find((c) => c.code === initialValue.iso) ?? null)
				: null,
		)
		const [searchQuery, setSearchQuery] = useState('')

		const currentCountry =
			selectedCountry ??
			countries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ??
			countries[0]

		const filteredCountries = countries.filter(
			(country) =>
				country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				country.dialCode.includes(searchQuery) ||
				country.code.toLowerCase().includes(searchQuery.toLowerCase()),
		)

		const handleCountryChange = (country: Country) => {
			setSelectedCountry(country)
			setSearchQuery('')
			onChange?.(null)
		}

		const handleNumberChange: MaskInputProps['onChange'] = (number) => {
			onChange?.(
				number
					? {
							ddi: currentCountry.dialCode,
							iso: currentCountry.code,
							number,
						}
					: null,
			)
		}

		const resolvedSize = props.size ?? 'md'
		const { root, countrySelector } = styles({
			size: resolvedSize,
		})

		return (
			<div className={cn(root(), config?.classNames?.root)}>
				<DropdownMenuPrimitive.Root>
					<DropdownMenuPrimitive.Trigger asChild>
						<button
							className={cn(
								countrySelector(),
								config?.classNames?.countrySelector,
							)}
							disabled={disabled}
							type="button"
						>
							<span className="t:text-lg">{currentCountry.flag}</span>
							<span className="t:text-muted-foreground">
								{currentCountry.dialCode}
							</span>
							<ChevronDown className="t:size-4 t:text-muted-foreground" />
						</button>
					</DropdownMenuPrimitive.Trigger>

					<DropdownMenuPrimitive.Portal>
						<DropdownMenuPrimitive.Content
							align="start"
							className="t:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:data-[side=bottom]:slide-in-from-top-2 t:data-[side=left]:slide-in-from-right-2 t:data-[side=right]:slide-in-from-left-2 t:data-[side=top]:slide-in-from-bottom-2 t:z-50 t:w-[300px] t:overflow-hidden t:rounded-md t:border t:bg-popover t:p-0 t:text-popover-foreground t:shadow-md t:data-[state=closed]:animate-out t:data-[state=open]:animate-in"
							sideOffset={4}
						>
							<div className="t:sticky t:top-0 t:border-b t:bg-popover">
								<div className="t:relative">
									<Search className="t:-translate-y-1/2 t:pointer-events-none t:absolute t:top-1/2 t:left-3 t:size-4 t:text-muted-foreground" />

									<input
										className="t:h-10 t:w-full t:bg-transparent t:py-2 t:pr-3 t:pl-9 t:text-sm t:outline-none t:placeholder:text-muted-foreground"
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder={
											translations?.searchCountry ?? 'Search country...'
										}
										type="text"
										value={searchQuery}
									/>
								</div>
							</div>

							<div className="t:max-h-[200px] t:overflow-y-auto t:p-1">
								{filteredCountries.length > 0 ? (
									filteredCountries.map((country) => (
										<DropdownMenuPrimitive.Item
											className="t:relative t:flex t:cursor-default t:select-none t:items-center t:rounded-sm t:px-2 t:py-1.5 t:text-sm t:outline-none t:transition-colors t:focus:bg-accent t:focus:text-accent-foreground t:data-[disabled]:pointer-events-none t:data-[disabled]:opacity-50"
											key={country.code}
											onClick={() => handleCountryChange(country)}
										>
											<span className="t:mr-2 t:text-lg">{country.flag}</span>
											<span className="t:flex-1">{country.name}</span>
											<span className="t:text-muted-foreground t:text-sm">
												{country.dialCode}
											</span>
										</DropdownMenuPrimitive.Item>
									))
								) : (
									<div className="t:p-2 t:text-center t:text-muted-foreground t:text-sm">
										{translations?.noCountriesFound ?? 'No countries found'}
									</div>
								)}
							</div>
						</DropdownMenuPrimitive.Content>
					</DropdownMenuPrimitive.Portal>
				</DropdownMenuPrimitive.Root>

				<div className="t:flex-1">
					<MaskInput
						{...props}
						className="t:rounded-l-none"
						disabled={disabled}
						key={currentCountry.code}
						mask={currentCountry.mask}
						onChange={handleNumberChange}
						ref={ref}
						value={value?.number}
					/>
				</div>
			</div>
		)
	},
)
