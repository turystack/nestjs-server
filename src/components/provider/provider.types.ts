import type { ButtonProps, ButtonSlots } from '@/components/button'
import type { LoaderProps, LoaderSlots } from '@/components/loader'
import type {
	ComponentClassNameSlots,
	ComponentDefaultProps,
} from '@/support/types'

export type ComponentConfig<T extends object, S extends string> = {
	classNames?: ComponentClassNameSlots<S>
	defaultProps?: ComponentDefaultProps<T>
}

export type TuryStackProviderProps = {
	components?: {
		button?: ComponentConfig<ButtonProps, ButtonSlots>
		loader?: ComponentConfig<LoaderProps, LoaderSlots>
	}
}
