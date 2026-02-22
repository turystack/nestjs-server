import type { ButtonProps, ButtonSlots } from '@/components/button'
import type {
	ComponentClassNameSlots,
	ComponentDefaultProps,
} from '@/support/types'

export type TuryStackProviderProps = {
	components?: {
		button?: {
			classNames?: ComponentClassNameSlots<ButtonSlots>
			defaultProps?: ComponentDefaultProps<ButtonProps>
		}
	}
}
