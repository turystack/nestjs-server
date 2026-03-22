import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { LayoutContent } from './content/content'
import { LayoutFooter } from './footer/footer'
import { LayoutHeader } from './header/header'
import { LayoutContext } from './layout.context'
import type { LayoutProps } from './layout.types'
import { LayoutMain } from './main/main'
import { LayoutSidebar } from './sidebar/sidebar'
import { SidebarProvider } from './sidebar/sidebar-primitives'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const layoutStyles = tv({
	slots: {
		root: 't:flex t:h-screen t:w-full t:overflow-hidden t:bg-background t:text-foreground',
	},
})

function LayoutRoot({
	withSidebar = false,
	children,
}: PropsWithChildren<LayoutProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.default

	const { root } = layoutStyles()

	return (
		<LayoutContext.Provider value={{ withSidebar }}>
			{withSidebar ? (
				<SidebarProvider className={cn(root(), config?.classNames?.root)}>
					{children}
				</SidebarProvider>
			) : (
				<div className={cn(root(), config?.classNames?.root)}>{children}</div>
			)}
		</LayoutContext.Provider>
	)
}

export const Layout = Object.assign(LayoutRoot, {
	Content: LayoutContent,
	Footer: LayoutFooter,
	Header: LayoutHeader,
	Main: LayoutMain,
	Sidebar: LayoutSidebar,
})
