export type SidebarSize = 'sm' | 'md' | 'lg'

export type LayoutSidebarProps = {
	bordered?: boolean
	collapsible?: 'offcanvas' | 'icon' | 'none'
	side?: 'left' | 'right'
	variant?: 'sidebar' | 'floating' | 'inset'
}

export type SidebarHeaderProps = {
	bordered?: boolean
	size?: SidebarSize
}

export type SidebarContentProps = {}

export type SidebarFooterProps = {
	bordered?: boolean
	size?: SidebarSize
}
