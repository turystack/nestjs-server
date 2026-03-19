import { Info } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type {
	FormFieldLabelProps,
	FormFieldProps,
	FormFieldSetProps,
	FormProps,
} from './form.types'

import { Label } from '@/components/label'
import { useInternalState } from '@/components/provider/provider.context'
import { Tooltip } from '@/components/tooltip'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		description: 't:text-muted-foreground t:text-sm',
		error: 't:text-destructive t:text-sm',
		field: 't:flex t:flex-col t:gap-1.5',
		fieldSet: 't:space-y-4 t:rounded-md t:border t:p-4',
		legend: 't:px-1 t:font-medium t:text-sm',
		root: 't:space-y-4',
	},
})

function Root({ onSubmit, children }: PropsWithChildren<FormProps>) {
	const state = useInternalState()
	const config = state?.components?.form?.default
	const { root } = styles()

	return (
		<form
			className={cn(root(), config?.classNames?.root)}
			onSubmit={onSubmit}
		>
			{children}
		</form>
	)
}

function FieldLabel({
	htmlFor,
	required,
	optional,
	disabled,
	tooltip,
	children,
}: PropsWithChildren<FormFieldLabelProps>) {
	return (
		<Label
			disabled={disabled}
			htmlFor={htmlFor}
			optional={optional}
			required={required}
			tooltip={tooltip}
		>
			{children}
		</Label>
	)
}

function Field({
	children,
	label,
	labelFloating,
	name,
	description,
	error,
}: PropsWithChildren<FormFieldProps>) {
	const state = useInternalState()
	const config = state?.components?.form?.field
	const { field, description: descriptionClass, error: errorClass } = styles()

	const resolvedLabel = typeof label === 'string' ? label : label?.content
	const labelConfig =
		typeof label === 'object' && label !== null ? label : undefined

	if (labelFloating && resolvedLabel) {
		return (
			<div className={cn('t:flex t:flex-col t:gap-1.5', config?.classNames?.root)}>
				{description && <p className={descriptionClass()}>{description}</p>}
				<div className="turystack-floating-label t:relative">
					<FieldLabel
						disabled={labelConfig?.disabled}
						htmlFor={labelConfig?.htmlFor ?? name}
						optional={labelConfig?.optional}
						required={labelConfig?.required}
						tooltip={labelConfig?.tooltip}
					>
						{resolvedLabel}
					</FieldLabel>
					{children}
				</div>
				{error && <p className={errorClass()}>{error}</p>}
			</div>
		)
	}

	return (
		<div className={cn(field(), config?.classNames?.root)}>
			{resolvedLabel && (
				<FieldLabel
					disabled={labelConfig?.disabled}
					htmlFor={labelConfig?.htmlFor ?? name}
					optional={labelConfig?.optional}
					required={labelConfig?.required}
					tooltip={labelConfig?.tooltip}
				>
					{resolvedLabel}
				</FieldLabel>
			)}
			{description && <p className={descriptionClass()}>{description}</p>}
			{children}
			{error && <p className={errorClass()}>{error}</p>}
		</div>
	)
}

function FieldSet({
	legend,
	tooltip,
	children,
}: PropsWithChildren<FormFieldSetProps>) {
	const state = useInternalState()
	const config = state?.components?.form?.fieldSet
	const { fieldSet, legend: legendClass } = styles()
	return (
		<fieldset className={cn(fieldSet(), config?.classNames?.root)}>
			{legend && (
				<legend className={cn(legendClass(), config?.classNames?.legend)}>
					{legend}
					{tooltip && (
						<Tooltip
							{...(typeof tooltip === 'string'
								? {
										content: tooltip,
									}
								: tooltip)}
						>
							<Info className="t:ml-1 t:inline-block t:h-3.5 t:w-3.5 t:shrink-0 t:cursor-help t:text-muted-foreground" />
						</Tooltip>
					)}
				</legend>
			)}
			{children}
		</fieldset>
	)
}

export const Form = Object.assign(Root, {
	Field,
	FieldSet,
})
