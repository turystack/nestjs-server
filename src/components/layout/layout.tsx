import type { PropsWithChildren } from 'react'
import { useCallback, useState } from 'react'
import { tv } from 'tailwind-variants'

import { LayoutContent } from './content/content'
import { SidebarContext } from './context'
import { LayoutFooter } from './footer/footer'
import { LayoutHeader } from './header/header'
import type { LayoutProps } from './layout.types'
import { LayoutMain } from './main/main'
import { LayoutNav } from './nav/nav'
import { LayoutSidebar } from './sidebar/sidebar'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const layoutStyles = tv({
	slots: {
		root: 't:flex t:h-screen t:w-full t:overflow-hidden t:bg-background t:text-foreground',
	},
})

function LayoutRoot({ children }: PropsWithChildren<LayoutProps>) {
	const state = useInternalState()
	const config = state?.components?.layout?.default

	const [collapsed, setCollapsed] = useState(false)

	const toggle = useCallback(() => setCollapsed((p) => !p), [])

	const { root } = layoutStyles()

	return (
		<SidebarContext.Provider
			value={{
				collapsed,
				setCollapsed,
				toggle,
			}}
		>
			<div className={cn(root(), config?.classNames?.root)}>{children}</div>
		</SidebarContext.Provider>
	)
}

export const Layout = Object.assign(LayoutRoot, {
	Content: LayoutContent,
	Footer: LayoutFooter,
	Header: LayoutHeader,
	Main: LayoutMain,
	Nav: LayoutNav,
	Sidebar: LayoutSidebar,
})
