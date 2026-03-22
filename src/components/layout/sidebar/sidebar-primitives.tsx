import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { PanelLeftIcon } from 'lucide-react'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import type { PropsWithChildren } from 'react'

import { Button } from '@/components/button'
import { Separator } from '@/components/separator'
import { Sheet } from '@/components/sheet'
import { Skeleton } from '@/components/skeleton'
import { Tooltip } from '@/components/tooltip'
import { useIsMobile } from '@/hooks'
import { cn } from '@/support/utils'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type SidebarContextProps = {
	state: 'expanded' | 'collapsed'
	open: boolean
	setOpen: (open: boolean) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextProps | null>(null)

function useSidebar() {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.')
	}
	return context
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

type SidebarProviderProps = PropsWithChildren<{
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
}>

function SidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange: setOpenProp,
	children,
}: SidebarProviderProps) {
	const isMobile = useIsMobile()
	const [openMobile, setOpenMobile] = useState(false)

	const [_open, _setOpen] = useState(defaultOpen)
	const open = openProp ?? _open
	const setOpen = useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === 'function' ? value(open) : value
			if (setOpenProp) {
				setOpenProp(openState)
			} else {
				_setOpen(openState)
			}
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
		},
		[setOpenProp, open],
	)

	const toggleSidebar = useCallback(() => {
		return isMobile
			? setOpenMobile((o) => !o)
			: setOpen((o: boolean) => !o)
	}, [isMobile, setOpen])

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault()
				toggleSidebar()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [toggleSidebar])

	const state = open ? 'expanded' : 'collapsed'

	const contextValue = useMemo<SidebarContextProps>(
		() => ({
			isMobile,
			open,
			openMobile,
			setOpen,
			setOpenMobile,
			state,
			toggleSidebar,
		}),
		[state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
	)

	return (
		<SidebarContext.Provider value={contextValue}>
			<div
				className="t:flex t:h-full t:w-full"
				data-slot="sidebar-wrapper"
				style={
					{
						'--sidebar-width': SIDEBAR_WIDTH,
						'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
					} as React.CSSProperties
				}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	)
}

// ---------------------------------------------------------------------------
// Sidebar (root)
// ---------------------------------------------------------------------------

type SidebarProps = PropsWithChildren<{
	side?: 'left' | 'right'
	variant?: 'sidebar' | 'floating' | 'inset'
	collapsible?: 'offcanvas' | 'icon' | 'none'
}>

function Sidebar({
	side = 'left',
	variant = 'sidebar',
	collapsible = 'icon',
	children,
}: SidebarProps) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

	if (collapsible === 'none') {
		return (
			<div
				className={cn(
					't:flex t:h-full t:w-(--sidebar-width) t:flex-col t:bg-sidebar t:text-sidebar-foreground',
				)}
				data-slot="sidebar"
			>
				{children}
			</div>
		)
	}

	if (isMobile) {
		return (
			<Sheet
				onChange={setOpenMobile}
				open={openMobile}
				side={side}
			>
				<div
					className="t:flex t:h-full t:w-full t:flex-col t:bg-sidebar t:text-sidebar-foreground"
					data-mobile="true"
					data-sidebar="sidebar"
					data-slot="sidebar"
					style={
						{
							'--sidebar-width': SIDEBAR_WIDTH_MOBILE,
						} as React.CSSProperties
					}
				>
					{children}
				</div>
			</Sheet>
		)
	}

	return (
		<div
			className={cn(
				't:group t:hidden t:h-full t:w-(--sidebar-width) t:shrink-0 t:flex-col t:bg-sidebar t:text-sidebar-foreground t:transition-[width] t:duration-200 t:ease-linear t:overflow-hidden md:t:flex',
				side === 'left' ? 't:border-r' : 't:border-l',
				collapsible === 'icon' && 'data-[collapsible=icon]:t:w-(--sidebar-width-icon)',
				collapsible === 'offcanvas' && 'data-[collapsible=offcanvas]:t:w-0',
			)}
			data-collapsible={state === 'collapsed' ? collapsible : ''}
			data-side={side}
			data-slot="sidebar"
			data-state={state}
			data-variant={variant}
		>
			{children}
		</div>
	)
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

function SidebarTrigger({
	onClick,
	...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'variant'>) {
	const { toggleSidebar } = useSidebar()

	return (
		<Button
			data-sidebar="trigger"
			data-slot="sidebar-trigger"
			onClick={(event) => {
				onClick?.(event)
				toggleSidebar()
			}}
			size="icon-sm"
			variant="ghost"
			{...props}
		>
			<PanelLeftIcon />
		</Button>
	)
}

// ---------------------------------------------------------------------------
// Rail
// ---------------------------------------------------------------------------

function SidebarRail({
	className,
	...props
}: React.ComponentProps<'button'>) {
	const { toggleSidebar } = useSidebar()

	return (
		<button
			aria-label="Toggle Sidebar"
			className={cn(
				't:-translate-x-1/2 group-data-[side=left]:t:-right-4 t:absolute t:inset-y-0 t:z-20 t:hidden t:w-4 t:transition-all t:ease-linear after:t:absolute after:t:inset-y-0 after:t:left-1/2 after:t:w-[2px] hover:after:t:bg-sidebar-border group-data-[side=right]:t:left-0 sm:t:flex',
				't:in-data-[side=left]:cursor-w-resize t:in-data-[side=right]:cursor-e-resize',
				't:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize t:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
				'group-data-[collapsible=offcanvas]:t:translate-x-0 hover:group-data-[collapsible=offcanvas]:t:bg-sidebar group-data-[collapsible=offcanvas]:after:t:left-full',
				't:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
				't:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
				className,
			)}
			data-sidebar="rail"
			data-slot="sidebar-rail"
			onClick={toggleSidebar}
			tabIndex={-1}
			title="Toggle Sidebar"
			type="button"
			{...props}
		/>
	)
}

// ---------------------------------------------------------------------------
// Inset
// ---------------------------------------------------------------------------

function SidebarInset({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('t:flex t:h-full t:flex-1 t:flex-col', className)}
			data-slot="sidebar-inset"
			{...props}
		/>
	)
}

// ---------------------------------------------------------------------------
// Structural components
// ---------------------------------------------------------------------------

function SidebarHeader({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('t:flex t:flex-col t:gap-2 t:p-2', className)}
			data-sidebar="header"
			data-slot="sidebar-header"
			{...props}
		/>
	)
}

function SidebarFooter({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('t:flex t:flex-col t:gap-2 t:p-2', className)}
			data-sidebar="footer"
			data-slot="sidebar-footer"
			{...props}
		/>
	)
}

function SidebarContent({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				't:flex t:min-h-0 t:flex-1 t:flex-col t:gap-2 t:overflow-auto group-data-[collapsible=icon]:t:overflow-hidden',
				className,
			)}
			data-sidebar="content"
			data-slot="sidebar-content"
			{...props}
		/>
	)
}

function SidebarSeparator(props: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-sidebar="separator"
			data-slot="sidebar-separator"
			{...props}
		/>
	)
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

function SidebarGroup({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('t:relative t:flex t:w-full t:min-w-0 t:flex-col t:p-2', className)}
			data-sidebar="group"
			data-slot="sidebar-group"
			{...props}
		/>
	)
}

function SidebarGroupLabel({
	className,
	asChild = false,
	...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : 'div'

	return (
		<Comp
			className={cn(
				't:flex t:h-8 t:shrink-0 t:items-center t:rounded-md t:px-2 t:font-medium t:text-sidebar-foreground/70 t:text-xs t:outline-hidden t:ring-sidebar-ring t:transition-[margin,opacity] t:duration-200 t:ease-linear focus-visible:t:ring-2 [&>svg]:t:size-4 [&>svg]:t:shrink-0',
				'group-data-[collapsible=icon]:t:-mt-8 group-data-[collapsible=icon]:t:opacity-0',
				className,
			)}
			data-sidebar="group-label"
			data-slot="sidebar-group-label"
			{...props}
		/>
	)
}

function SidebarGroupAction({
	className,
	asChild = false,
	...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			className={cn(
				't:absolute t:top-3.5 t:right-3 t:flex t:aspect-square t:w-5 t:items-center t:justify-center t:rounded-md t:p-0 t:text-sidebar-foreground t:outline-hidden t:ring-sidebar-ring t:transition-transform hover:t:bg-sidebar-accent hover:t:text-sidebar-accent-foreground focus-visible:t:ring-2 [&>svg]:t:size-4 [&>svg]:t:shrink-0',
				'after:t:-inset-2 after:t:absolute md:after:t:hidden',
				'group-data-[collapsible=icon]:t:hidden',
				className,
			)}
			data-sidebar="group-action"
			data-slot="sidebar-group-action"
			{...props}
		/>
	)
}

function SidebarGroupContent({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('t:w-full t:text-sm', className)}
			data-sidebar="group-content"
			data-slot="sidebar-group-content"
			{...props}
		/>
	)
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function SidebarMenu({
	className,
	...props
}: React.ComponentProps<'ul'>) {
	return (
		<ul
			className={cn('t:flex t:w-full t:min-w-0 t:flex-col t:gap-1', className)}
			data-sidebar="menu"
			data-slot="sidebar-menu"
			{...props}
		/>
	)
}

function SidebarMenuItem({
	className,
	...props
}: React.ComponentProps<'li'>) {
	return (
		<li
			className={cn('t:group/menu-item t:relative', className)}
			data-sidebar="menu-item"
			data-slot="sidebar-menu-item"
			{...props}
		/>
	)
}

const sidebarMenuButtonVariants = cva(
	't:peer/menu-button t:flex t:w-full t:items-center t:gap-2 t:overflow-hidden t:rounded-md t:p-2 t:text-left t:text-sm t:outline-hidden t:ring-sidebar-ring t:transition-[width,height,padding] hover:t:bg-sidebar-accent hover:t:text-sidebar-accent-foreground focus-visible:t:ring-2 active:t:bg-sidebar-accent active:t:text-sidebar-accent-foreground disabled:t:pointer-events-none disabled:t:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:t:pr-8 aria-disabled:t:pointer-events-none aria-disabled:t:opacity-50 data-[active=true]:t:bg-sidebar-accent data-[active=true]:t:font-medium data-[active=true]:t:text-sidebar-accent-foreground data-[state=open]:hover:t:bg-sidebar-accent data-[state=open]:hover:t:text-sidebar-accent-foreground group-data-[collapsible=icon]:t:size-8! [&>span:last-child]:t:truncate [&>svg]:t:size-4 [&>svg]:t:shrink-0',
	{
		defaultVariants: {
			size: 'default',
			variant: 'default',
		},
		variants: {
			size: {
				default: 't:h-8 t:text-sm',
				lg: 't:h-12 t:text-sm group-data-[collapsible=icon]:t:p-0!',
				sm: 't:h-7 t:text-xs',
			},
			variant: {
				default:
					'hover:t:bg-sidebar-accent hover:t:text-sidebar-accent-foreground',
				outline:
					't:bg-background t:shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:t:bg-sidebar-accent hover:t:text-sidebar-accent-foreground hover:t:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
			},
		},
	},
)

function SidebarMenuButton({
	asChild = false,
	isActive = false,
	variant = 'default',
	size = 'default',
	tooltip,
	className,
	...props
}: React.ComponentProps<'button'> & {
	asChild?: boolean
	isActive?: boolean
	tooltip?: string | React.ReactNode
} & VariantProps<typeof sidebarMenuButtonVariants>) {
	const Comp = asChild ? Slot : 'button'
	const { isMobile, state } = useSidebar()

	const button = (
		<Comp
			className={cn(sidebarMenuButtonVariants({ size, variant }), className)}
			data-active={isActive}
			data-sidebar="menu-button"
			data-size={size}
			data-slot="sidebar-menu-button"
			{...props}
		/>
	)

	if (!tooltip) {
		return button
	}

	const tooltipContent = typeof tooltip === 'string' ? tooltip : tooltip

	if (state !== 'collapsed' || isMobile) {
		return button
	}

	return (
		<Tooltip
			content={tooltipContent}
			side="right"
			sideOffset={4}
		>
			{button}
		</Tooltip>
	)
}

function SidebarMenuAction({
	className,
	asChild = false,
	showOnHover = false,
	...props
}: React.ComponentProps<'button'> & {
	asChild?: boolean
	showOnHover?: boolean
}) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			className={cn(
				't:absolute t:top-1.5 t:right-1 t:flex t:aspect-square t:w-5 t:items-center t:justify-center t:rounded-md t:p-0 t:text-sidebar-foreground t:outline-hidden t:ring-sidebar-ring t:transition-transform hover:t:bg-sidebar-accent hover:t:text-sidebar-accent-foreground focus-visible:t:ring-2 peer-hover/menu-button:t:text-sidebar-accent-foreground [&>svg]:t:size-4 [&>svg]:t:shrink-0',
				'after:t:-inset-2 after:t:absolute md:after:t:hidden',
				'peer-data-[size=sm]/menu-button:t:top-1',
				'peer-data-[size=default]/menu-button:t:top-1.5',
				'peer-data-[size=lg]/menu-button:t:top-2.5',
				'group-data-[collapsible=icon]:t:hidden',
				showOnHover &&
					'group-focus-within/menu-item:t:opacity-100 group-hover/menu-item:t:opacity-100 data-[state=open]:t:opacity-100 peer-data-[active=true]/menu-button:t:text-sidebar-accent-foreground md:t:opacity-0',
				className,
			)}
			data-sidebar="menu-action"
			data-slot="sidebar-menu-action"
			{...props}
		/>
	)
}

function SidebarMenuBadge({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				't:pointer-events-none t:absolute t:right-1 t:flex t:h-5 t:min-w-5 t:select-none t:items-center t:justify-center t:rounded-md t:px-1 t:font-medium t:text-sidebar-foreground t:text-xs t:tabular-nums',
				'peer-hover/menu-button:t:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:t:text-sidebar-accent-foreground',
				'peer-data-[size=sm]/menu-button:t:top-1',
				'peer-data-[size=default]/menu-button:t:top-1.5',
				'peer-data-[size=lg]/menu-button:t:top-2.5',
				'group-data-[collapsible=icon]:t:hidden',
				className,
			)}
			data-sidebar="menu-badge"
			data-slot="sidebar-menu-badge"
			{...props}
		/>
	)
}

function SidebarMenuSkeleton({
	className,
	showIcon = false,
	...props
}: React.ComponentProps<'div'> & { showIcon?: boolean }) {
	const width = useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`
	}, [])

	return (
		<div
			className={cn('t:flex t:h-8 t:items-center t:gap-2 t:rounded-md t:px-2', className)}
			data-sidebar="menu-skeleton"
			data-slot="sidebar-menu-skeleton"
			{...props}
		>
			{showIcon && (
				<Skeleton className="t:size-4 t:rounded-md" />
			)}
			<div
				className="t:h-4 t:flex-1"
				style={{ maxWidth: width }}
			>
				<Skeleton className="t:h-full t:w-full" />
			</div>
		</div>
	)
}

// ---------------------------------------------------------------------------
// Menu Sub
// ---------------------------------------------------------------------------

function SidebarMenuSub({
	className,
	...props
}: React.ComponentProps<'ul'>) {
	return (
		<ul
			className={cn(
				't:mx-3.5 t:flex t:min-w-0 t:translate-x-px t:flex-col t:gap-1 t:border-sidebar-border t:border-l t:px-2.5 t:py-0.5',
				'group-data-[collapsible=icon]:t:hidden',
				className,
			)}
			data-sidebar="menu-sub"
			data-slot="sidebar-menu-sub"
			{...props}
		/>
	)
}

function SidebarMenuSubItem({
	className,
	...props
}: React.ComponentProps<'li'>) {
	return (
		<li
			className={cn('t:group/menu-sub-item t:relative', className)}
			data-sidebar="menu-sub-item"
			data-slot="sidebar-menu-sub-item"
			{...props}
		/>
	)
}

function SidebarMenuSubButton({
	asChild = false,
	size = 'md',
	isActive = false,
	className,
	...props
}: React.ComponentProps<'a'> & {
	asChild?: boolean
	size?: 'sm' | 'md'
	isActive?: boolean
}) {
	const Comp = asChild ? Slot : 'a'

	return (
		<Comp
			className={cn(
				't:-translate-x-px t:flex t:h-7 t:min-w-0 t:items-center t:gap-2 t:overflow-hidden t:rounded-md t:px-2 t:text-sidebar-foreground t:outline-hidden t:ring-sidebar-ring hover:t:bg-sidebar-accent hover:t:text-sidebar-accent-foreground focus-visible:t:ring-2 active:t:bg-sidebar-accent active:t:text-sidebar-accent-foreground disabled:t:pointer-events-none disabled:t:opacity-50 aria-disabled:t:pointer-events-none aria-disabled:t:opacity-50 [&>span:last-child]:t:truncate [&>svg]:t:size-4 [&>svg]:t:shrink-0 [&>svg]:t:text-sidebar-accent-foreground',
				'data-[active=true]:t:bg-sidebar-accent data-[active=true]:t:text-sidebar-accent-foreground',
				size === 'sm' && 't:text-xs',
				size === 'md' && 't:text-sm',
				'group-data-[collapsible=icon]:t:hidden',
				className,
			)}
			data-active={isActive}
			data-sidebar="menu-sub-button"
			data-size={size}
			data-slot="sidebar-menu-sub-button"
			{...props}
		/>
	)
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
}
