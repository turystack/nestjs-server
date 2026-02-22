import type { ButtonProps, ButtonSlots } from '@/components/button'
import type { ComponentClassNameSlots } from '@/support/types'

export type TuryStackProviderProps = {
	button?: {
		classNames?: ComponentClassNameSlots<ButtonSlots>
		defaultProps?: Partial<ButtonProps>
	}
}
