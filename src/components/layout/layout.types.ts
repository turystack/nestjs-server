import type {
	LayoutContentProps,
	LayoutContentSlots,
} from './content/content.types'
import type {
	LayoutFooterProps,
	LayoutFooterSlots,
} from './footer/footer.types'
import type { LayoutMainProps, LayoutMainSlots } from './main/main.types'

import type { ComponentConfig } from '@/support/types'

// Slots
export type LayoutSlots = 'root'

// Props
export type LayoutProps = {
	withSidebar?: boolean
}

// Config
export type LayoutConfig = {
	default?: ComponentConfig<LayoutProps, LayoutSlots>
	main?: ComponentConfig<LayoutMainProps, LayoutMainSlots>
	content?: ComponentConfig<LayoutContentProps, LayoutContentSlots>
	footer?: ComponentConfig<LayoutFooterProps, LayoutFooterSlots>
}
