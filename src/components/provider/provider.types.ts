import type { AccordionConfig } from '@/components/accordion'
import type { AlertConfig } from '@/components/alert'
import type { AvatarConfig } from '@/components/avatar'
import type { BadgeConfig } from '@/components/badge'
import type { BreadcrumbConfig } from '@/components/breadcrumb'
import type { ButtonConfig } from '@/components/button'
import type { CardConfig } from '@/components/card'
import type { CheckboxConfig } from '@/components/checkbox'
import type { ColorScheme } from '@/components/color-scheme'
import type { CurrencyInputConfig } from '@/components/currency-input'
import type { DateInputConfig } from '@/components/date-input/date-input.types'
import type { DateRangeInputConfig } from '@/components/date-range-input/date-range-input.types'
import type { DocumentInputConfig } from '@/components/document-input/document-input.types'
import type { DropdownMenuConfig } from '@/components/dropdown-menu/dropdown-menu.types'
import type { FormConfig } from '@/components/form/form.types'
import type { I18nTranslations } from '@/components/i18n/i18n.types'
import type { InputConfig } from '@/components/input'
import type { HeaderConfig } from '@/components/layout/header/header.types'
import type { LayoutConfig } from '@/components/layout/layout.types'
import type { LoaderConfig } from '@/components/loader'
import type { MaskInputConfig } from '@/components/mask-input/mask-input.types'
import type { ModalConfig } from '@/components/modal'
import type { NumberInputConfig } from '@/components/number-input/number-input.types'
import type { OTPInputConfig } from '@/components/otp-input/otp-input.types'
import type { PaginationConfig } from '@/components/pagination/pagination.types'
import type { PhoneInputConfig } from '@/components/phone-input/phone-input.types'
import type { SelectConfig } from '@/components/select/select.types'
import type { SeparatorConfig } from '@/components/separator'
import type { SheetConfig } from '@/components/sheet'
import type { SkeletonConfig } from '@/components/skeleton'
import type { TableConfig } from '@/components/table/table.types'
import type { TabsConfig } from '@/components/tabs'
import type { TagsInputConfig } from '@/components/tags-input/tags-input.types'
import type { TextareaConfig } from '@/components/textarea/textarea.types'
import type { ThemeProps } from '@/components/theme'
import type { TooltipConfig } from '@/components/tooltip/tooltip.types'

export type ProviderProps = {
	defaultColorScheme?: ColorScheme
	persistTheme?: boolean
	theme?: ThemeProps
	translations?: I18nTranslations
	components?: {
		accordion?: AccordionConfig
		alert?: AlertConfig
		avatar?: AvatarConfig
		badge?: BadgeConfig
		breadcrumb?: BreadcrumbConfig
		button?: ButtonConfig
		card?: CardConfig
		checkbox?: CheckboxConfig
		currencyInput?: CurrencyInputConfig
		dateInput?: DateInputConfig
		dateRangeInput?: DateRangeInputConfig
		documentInput?: DocumentInputConfig
		dropdownMenu?: DropdownMenuConfig
		form?: FormConfig
		input?: InputConfig
		loader?: LoaderConfig
		numberInput?: NumberInputConfig
		maskInput?: MaskInputConfig
		modal?: ModalConfig
		otpInput?: OTPInputConfig
		pagination?: PaginationConfig
		phoneInput?: PhoneInputConfig
		select?: SelectConfig
		separator?: SeparatorConfig
		sheet?: SheetConfig
		skeleton?: SkeletonConfig
		table?: TableConfig
		tabs?: TabsConfig
		tagsInput?: TagsInputConfig
		textarea?: TextareaConfig
		tooltip?: TooltipConfig
		layout?: LayoutConfig & {
			header?: HeaderConfig
		}
	}
}
