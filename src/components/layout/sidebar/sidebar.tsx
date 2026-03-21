import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { tv } from 'tailwind-variants'

import type {
	LayoutSidebarProps,
	SidebarBodyProps,
	SidebarFooterProps,
	SidebarHeaderProps,
} from './sidebar.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'
import { useSidebar } from '../context'

const sidebarStyles = tv({
	slots: {
		root: 't:flex t:shrink-0 t:flex-col t:overflow-hidden t:bg-sidebar t:transition-all t:duration-200',
	},
	variants: {
		bordered: {
			true: {
				root: 't:border-border t:border-r',
			},
		},
	},
})

const sidebarHeaderStyles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		root: 't:flex t:shrink-0 t:items-center t:justify-between t:px-4',
	},
	variants: {
		bordered: {
			true: {
				root: 't:border-border t:border-b',
			},
		},
		size: {
			lg: {
				root: 't:h-16',
			},
			md: {
				root: 't:h-14',
			},
			sm: {
				root: 't:h-10',
			},
		},
	},
})

const sidebarBodyStyles = tv({
	slots: {
		root: 't:flex t:flex-1 t:flex-col t:overflow-y-auto',
	},
})

const sidebarFooterStyles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		root: 't:flex t:shrink-0 t:items-center t:px-4',
	},
	variants: {
		bordered: {
			true: {
				root: 't:border-border t:border-t',
			},
		},
		size: {
			lg: {
				root: 't:h-16',
			},
			md: {
				root: 't:h-14',
			},
			sm: {
				root: 't:h-10',
			},
		},
	},
})

const sidebarTriggerStyles = tv({
	slots: {
		root: 't:flex t:items-center t:justify-center t:rounded-md t:p-1.5 t:text-muted-foreground t:transition-colors t:hover:bg-accent t:hover:text-accent-foreground',
	},
})

const widthMap = {
	default: 't:w-60',
	wide: 't:w-80',
} as const
const pxMap = {
	lg: 't:px-6',
	md: 't:px-4',
	sm: 't:px-2',
} as const
const pyMap = {
	lg: 't:py-6',
	md: 't:py-4',
	sm: 't:py-2',
} as const

function SidebarRoot({
	children,
	bordered,
	width = 'default',
	paddingHorizontal,
	paddingVertical,
}: PropsWithChildren<LayoutSidebarProps>) {
	const { collapsed } = useSidebar()
	const state = useInternalState()
	const config = state?.components?.layout?.sidebar?.default
	const { root } = sidebarStyles({
		bordered,
	})
	return (
		<aside
			className={cn(
				root(),
				collapsed ? 't:w-16' : widthMap[width],
				paddingHorizontal && pxMap[paddingHorizontal],
				paddingVertical && pyMap[paddingVertical],
				config?.classNames?.root,
			)}
		>
			{children}
		</aside>
	)
}

export function SidebarHeader({
	children,
	bordered,
	size,
}: PropsWithChildren<SidebarHeaderProps>) {
	const { collapsed } = useSidebar()
	const state = useInternalState()
	const config = state?.components?.layout?.sidebar?.header
	const { root } = sidebarHeaderStyles({
		bordered,
		size,
	})

	if (collapsed) {
		const trigger = React.Children.toArray(children).find(
			(child) =>
				React.isValidElement(child) &&
				(
					child.type as {
						displayName?: string
					}
				).displayName === 'Sidebar.Trigger',
		)
		return (
			<div className={cn(root(), 't:justify-center', config?.classNames?.root)}>
				{trigger}
			</div>
		)
	}

	return <div className={cn(root(), config?.classNames?.root)}>{children}</div>
}

export function SidebarBody({ children }: PropsWithChildren<SidebarBodyProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.sidebar?.body
	const { root } = sidebarBodyStyles()
	return <div className={cn(root(), config?.classNames?.root)}>{children}</div>
}

export function SidebarFooter({
	children,
	bordered,
	size,
}: PropsWithChildren<SidebarFooterProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.sidebar?.footer
	const { root } = sidebarFooterStyles({
		bordered,
		size,
	})
	return <div className={cn(root(), config?.classNames?.root)}>{children}</div>
}

export function SidebarTrigger() {
	const { collapsed, toggle } = useSidebar()
	const { root } = sidebarTriggerStyles()
	const Icon = collapsed ? PanelLeftOpen : PanelLeftClose
	return (
		<button
			aria-label="Toggle sidebar"
			className={root()}
			onClick={toggle}
			type="button"
		>
			<Icon className="t:h-4 t:w-4" />
		</button>
	)
}

SidebarHeader.displayName = 'Sidebar.Header'
SidebarBody.displayName = 'Sidebar.Body'
SidebarFooter.displayName = 'Sidebar.Footer'
SidebarTrigger.displayName = 'Sidebar.Trigger'

export const LayoutSidebar = Object.assign(SidebarRoot, {
	Body: SidebarBody,
	Footer: SidebarFooter,
	Header: SidebarHeader,
	Trigger: SidebarTrigger,
})
