import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'

import type { NavProps, SidebarNavItem, SidebarNavSubItem } from './nav.types'

import { Tooltip } from '@/components/tooltip/tooltip'
import { cn } from '@/support/utils'
import { useSidebar } from '../context'

const chevronStyles = tv({
	base: 't:h-4 t:w-4 t:shrink-0 t:text-muted-foreground t:transition-transform t:duration-200',
	variants: {
		open: {
			true: 't:rotate-180',
		},
	},
})

const popoverContentClass =
	't:z-50 t:min-w-[180px] t:rounded-md t:border t:border-border t:bg-popover t:p-1 t:text-popover-foreground t:shadow-md t:outline-none t:data-[state=open]:animate-in t:data-[state=closed]:animate-out t:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:data-[side=right]:slide-in-from-left-2'

function NavSubItem({
	sub,
	inPopover,
}: {
	sub: SidebarNavSubItem
	inPopover?: boolean
}) {
	const Icon = sub.icon
	return (
		<div
			className={cn(
				't:flex t:w-full t:cursor-pointer t:items-center t:text-sm t:transition-colors',
				't:hover:bg-accent t:hover:text-accent-foreground',
				inPopover
					? cn(
							't:gap-2 t:rounded-sm t:px-2 t:py-1.5',
							sub.active
								? 't:font-medium t:text-popover-foreground'
								: 't:text-muted-foreground',
						)
					: cn(
							't:gap-3 t:rounded-md t:px-2 t:py-1.5',
							sub.active
								? 't:font-medium t:text-foreground'
								: 't:text-muted-foreground',
						),
			)}
		>
			{Icon && <Icon className="t:h-3.5 t:w-3.5 t:shrink-0" />}
			<span className="t:truncate">{sub.label}</span>
		</div>
	)
}

const tooltipContentClass =
	't:z-50 t:overflow-hidden t:rounded-md t:border t:bg-popover t:px-3 t:py-1.5 t:text-popover-foreground t:text-sm t:shadow-md t:animate-in t:fade-in-0 t:zoom-in-95 data-[state=closed]:t:animate-out data-[state=closed]:t:fade-out-0 data-[state=closed]:t:zoom-out-95 t:data-[side=right]:slide-in-from-left-2'

function CollapsedNavItemWithChildren({
	item,
	itemClass,
	iconEl,
}: {
	item: SidebarNavItem
	itemClass: string
	iconEl: ReactNode
}) {
	const [popoverOpen, setPopoverOpen] = useState(false)

	return (
		<TooltipPrimitive.Provider delayDuration={0}>
			<TooltipPrimitive.Root open={popoverOpen ? false : undefined}>
				<TooltipPrimitive.Trigger asChild>
					<div>
						<PopoverPrimitive.Root
							onOpenChange={setPopoverOpen}
							open={popoverOpen}
						>
							<PopoverPrimitive.Trigger asChild>
								<button
									className={itemClass}
									type="button"
								>
									{iconEl}
								</button>
							</PopoverPrimitive.Trigger>
							<PopoverPrimitive.Portal>
								<PopoverPrimitive.Content
									className={popoverContentClass}
									side="right"
									sideOffset={16}
								>
									<div className="t:px-2 t:py-1.5 t:font-semibold t:text-popover-foreground t:text-xs">
										{item.label}
									</div>
									<div className="t:my-1 t:h-px t:bg-border" />
									{item.children!.map((sub) => (
										<NavSubItem
											inPopover
											key={sub.href ?? sub.label}
											sub={sub}
										/>
									))}
								</PopoverPrimitive.Content>
							</PopoverPrimitive.Portal>
						</PopoverPrimitive.Root>
					</div>
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						className={tooltipContentClass}
						side="right"
						sideOffset={8}
					>
						{item.label}
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	)
}

function NavItem({ item }: { item: SidebarNavItem }) {
	const { collapsed } = useSidebar()
	const [open, setOpen] = useState(
		item.children?.some((c) => c.active) ?? false,
	)
	const Icon = item.icon
	const hasChildren = !!item.children?.length

	const itemClass = cn(
		't:group t:flex t:w-full t:cursor-pointer t:items-center t:rounded-md t:text-sm t:transition-colors',
		't:hover:bg-accent t:hover:text-accent-foreground',
		item.active
			? 't:bg-accent t:font-medium t:text-accent-foreground'
			: 't:text-muted-foreground',
	)

	const iconEl = Icon ? <Icon className="t:h-4 t:w-4 t:shrink-0" /> : null

	if (collapsed) {
		const collapsedClass = cn(
			itemClass,
			't:h-9 t:w-full t:justify-center t:px-0',
		)

		if (hasChildren) {
			return (
				<CollapsedNavItemWithChildren
					iconEl={iconEl}
					item={item}
					itemClass={collapsedClass}
				/>
			)
		}

		return (
			<Tooltip
				content={item.label}
				side="right"
				sideOffset={8}
			>
				<button
					className={collapsedClass}
					type="button"
				>
					{iconEl}
				</button>
			</Tooltip>
		)
	}

	return (
		<div className="t:flex t:flex-col">
			<button
				className={cn(itemClass, 't:gap-3 t:px-2 t:py-2')}
				onClick={() => hasChildren && setOpen((p) => !p)}
				type="button"
			>
				{iconEl}
				<span className="t:flex-1 t:truncate t:text-left">{item.label}</span>
				{hasChildren && (
					<ChevronDown
						className={chevronStyles({
							open,
						})}
					/>
				)}
			</button>

			{hasChildren && (
				<div
					className={cn(
						't:grid t:transition-[grid-template-rows,opacity] t:duration-200',
						open
							? 't:grid-rows-[1fr] t:opacity-100'
							: 't:grid-rows-[0fr] t:opacity-0',
					)}
				>
					<div className="t:min-h-0 t:overflow-hidden">
						<div className="t:mt-0.5 t:ml-3 t:flex t:flex-col t:gap-0.5 t:border-border t:border-l t:pb-0.5 t:pl-2">
							{item.children!.map((sub) => (
								<NavSubItem
									key={sub.href ?? sub.label}
									sub={sub}
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function NavDivider({ collapsed }: { collapsed: boolean }) {
	return (
		<div className={cn('t:my-2', collapsed ? 't:mx-2' : 't:mx-1')}>
			<div className="t:h-px t:bg-border" />
		</div>
	)
}

export function LayoutNav({ items }: NavProps) {
	const { collapsed } = useSidebar()
	return (
		<nav className="t:flex t:w-full t:flex-col t:gap-1 t:p-2">
			{items
				.map((entry) => {
					if (entry.type === 'divider') {
						return null
					}
					return (
						<NavItem
							item={entry.item}
							key={entry.item.href ?? entry.item.label}
						/>
					)
				})
				.reduce<React.ReactElement[]>((acc, el) => {
					if (el === null) {
						acc.push(
							<NavDivider
								collapsed={collapsed}
								key={`divider-after-${acc.length}`}
							/>,
						)
					} else {
						acc.push(el)
					}
					return acc
				}, [])}
		</nav>
	)
}
