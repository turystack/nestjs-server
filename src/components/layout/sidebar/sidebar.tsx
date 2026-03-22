import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type {
	LayoutSidebarProps,
	SidebarContentProps,
	SidebarFooterProps,
	SidebarHeaderProps,
} from './sidebar.types'
import {
	Sidebar,
	SidebarContent as SidebarContentPrimitive,
	SidebarFooter as SidebarFooterPrimitive,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader as SidebarHeaderPrimitive,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	SidebarTrigger,
} from './sidebar-primitives'

const sidebarHeaderStyles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		root: 't:flex t:shrink-0 t:items-center t:justify-between t:px-2',
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

const sidebarFooterStyles = tv({
	defaultVariants: {
		size: 'md',
	},
	slots: {
		root: 't:flex t:shrink-0 t:items-center t:px-2',
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

function SidebarRoot({
	children,
	collapsible,
	side,
	variant,
}: PropsWithChildren<LayoutSidebarProps>) {
	return (
		<Sidebar
			collapsible={collapsible}
			side={side}
			variant={variant}
		>
			{children}
		</Sidebar>
	)
}

export function LayoutSidebarHeader({
	children,
	bordered,
	size,
}: PropsWithChildren<SidebarHeaderProps>) {
	const { root } = sidebarHeaderStyles({
		bordered,
		size,
	})

	return (
		<SidebarHeaderPrimitive className={root()}>
			{children}
		</SidebarHeaderPrimitive>
	)
}

export function LayoutSidebarContent({
	children,
}: PropsWithChildren<SidebarContentProps>) {
	return <SidebarContentPrimitive>{children}</SidebarContentPrimitive>
}

export function LayoutSidebarFooter({
	children,
	bordered,
	size,
}: PropsWithChildren<SidebarFooterProps>) {
	const { root } = sidebarFooterStyles({
		bordered,
		size,
	})

	return (
		<SidebarFooterPrimitive className={root()}>
			{children}
		</SidebarFooterPrimitive>
	)
}

LayoutSidebarHeader.displayName = 'Sidebar.Header'
LayoutSidebarContent.displayName = 'Sidebar.Content'
LayoutSidebarFooter.displayName = 'Sidebar.Footer'

export const LayoutSidebar = Object.assign(SidebarRoot, {
	Content: LayoutSidebarContent,
	Footer: LayoutSidebarFooter,
	Group: Object.assign(SidebarGroup, {
		Content: SidebarGroupContent,
		Label: SidebarGroupLabel,
	}),
	Header: LayoutSidebarHeader,
	Menu: Object.assign(SidebarMenu, {
		Button: SidebarMenuButton,
		Item: SidebarMenuItem,
	}),
	Separator: SidebarSeparator,
	Trigger: SidebarTrigger,
})
