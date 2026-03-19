export type FormSlots = 'root'

export type FormProps = {
	onSubmit?: React.FormEventHandler<HTMLFormElement>
}

export type FormFieldSlots = 'root'

export type FormFieldLabelInput =
	| string
	| (import('@/components/label').LabelProps & {
			content: string
	  })

export type FormFieldProps = {
	label?: FormFieldLabelInput
	labelFloating?: boolean
	name?: string
	description?: React.ReactNode
	error?: React.ReactNode
}

export type FormFieldLabelProps = {
	htmlFor?: string
	required?: boolean
	optional?: boolean
	disabled?: boolean
	tooltip?: React.ReactNode
}

export type FormFieldSetSlots = 'root' | 'legend'

import type { TooltipProps } from '@/components/tooltip'

export type FormFieldSetTooltip = string | TooltipProps

export type FormFieldSetProps = {
	legend?: string
	tooltip?: FormFieldSetTooltip
}

import type { ComponentConfig } from '@/support/types'

export type FormConfig = {
	default?: ComponentConfig<FormProps, FormSlots>
	field?: ComponentConfig<FormFieldProps, FormFieldSlots>
	fieldSet?: ComponentConfig<FormFieldSetProps, FormFieldSetSlots>
}
