import * as LabelPrimitive from '@radix-ui/react-label'
import { Info } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LabelProps } from './label.types'

import { useInternalState } from '@/components/provider/provider.context'
import { Tooltip } from '@/components/tooltip'

const styles = tv({
	slots: {
		optional: 't:ml-1 t:text-muted-foreground t:text-xs',
		required: 't:ml-0.5 t:text-destructive',
		root: 't:font-medium t:text-sm t:leading-none t:peer-disabled:cursor-not-allowed t:peer-disabled:opacity-70',
		tooltipIcon:
			't:ml-1 t:inline-block t:h-3.5 t:w-3.5 t:shrink-0 t:cursor-help t:text-muted-foreground',
	},
	variants: {
		disabled: {
			true: {
				root: 't:cursor-not-allowed t:opacity-70',
			},
		},
	},
})

export function Label({
	htmlFor,
	required,
	optional,
	disabled,
	tooltip,
	children,
}: PropsWithChildren<LabelProps>) {
	const state = useInternalState()
	const translations = state?.translations?.label

	const {
		root,
		required: requiredClass,
		optional: optionalClass,
		tooltipIcon,
	} = styles({
		disabled: !!disabled,
	})

	return (
		<LabelPrimitive.Root
			className={root()}
			htmlFor={htmlFor}
		>
			{children}

			{required && <span className={requiredClass()}>{translations?.required ?? ' *'}</span>}

			{optional && <span className={optionalClass()}>{translations?.optional ?? ' (optional)'}</span>}

			{tooltip && (
				<Tooltip content={tooltip}>
					<Info className={tooltipIcon()} />
				</Tooltip>
			)}
		</LabelPrimitive.Root>
	)
}
