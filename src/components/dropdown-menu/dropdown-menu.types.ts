export type DropdownMenuSlots = 'root'

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'

export type DropdownMenuAlign = 'start' | 'center' | 'end'

export type DropdownMenuProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export type DropdownMenuTriggerSlots = 'root'

export type DropdownMenuTriggerProps = {
	asChild?: boolean
}

export type DropdownMenuContentSlots = 'root'

export type DropdownMenuContentProps = {
	width?: React.CSSProperties['width']
	side?: DropdownMenuSide
	align?: DropdownMenuAlign
	sideOffset?: number
}

export type DropdownMenuItemVariant = 'default' | 'destructive'

export type DropdownMenuItemSlots = 'root' | 'icon'

export type DropdownMenuItemProps = {
	variant?: DropdownMenuItemVariant
	disabled?: boolean
	asChild?: boolean
	onClick?: React.MouseEventHandler<HTMLDivElement>
}

export type DropdownMenuCheckboxItemSlots = 'root' | 'indicator'

export type DropdownMenuCheckboxItemProps = {
	checked?: boolean
	disabled?: boolean
	onCheckedChange?: (checked: boolean) => void
}

export type DropdownMenuRadioGroupSlots = 'root'

export type DropdownMenuRadioGroupProps = {
	value?: string
	onValueChange?: (value: string) => void
}

export type DropdownMenuRadioItemSlots = 'root' | 'indicator'

export type DropdownMenuRadioItemProps = {
	value: string
	disabled?: boolean
}

export type DropdownMenuLabelSlots = 'root'

export type DropdownMenuLabelProps = {
	inset?: boolean
}

export type DropdownMenuSeparatorSlots = 'root'

export type DropdownMenuSeparatorProps = {}

export type DropdownMenuShortcutSlots = 'root'

export type DropdownMenuShortcutProps = {}

export type DropdownMenuGroupSlots = 'root'

export type DropdownMenuGroupProps = {}

export type DropdownMenuSubSlots = 'root'

export type DropdownMenuSubProps = {}

export type DropdownMenuSubTriggerSlots = 'root' | 'icon'

export type DropdownMenuSubTriggerProps = {
	inset?: boolean
}

export type DropdownMenuSubContentSlots = 'root'

export type DropdownMenuSubContentProps = {}

import type { ComponentConfig } from '@/support/types'

export type DropdownMenuConfig = {
	content?: ComponentConfig<DropdownMenuContentProps, DropdownMenuContentSlots>
	item?: ComponentConfig<DropdownMenuItemProps, DropdownMenuItemSlots>
	checkboxItem?: ComponentConfig<
		DropdownMenuCheckboxItemProps,
		DropdownMenuCheckboxItemSlots
	>
	radioItem?: ComponentConfig<
		DropdownMenuRadioItemProps,
		DropdownMenuRadioItemSlots
	>
	label?: ComponentConfig<DropdownMenuLabelProps, DropdownMenuLabelSlots>
	separator?: ComponentConfig<
		DropdownMenuSeparatorProps,
		DropdownMenuSeparatorSlots
	>
	subTrigger?: ComponentConfig<
		DropdownMenuSubTriggerProps,
		DropdownMenuSubTriggerSlots
	>
	subContent?: ComponentConfig<
		DropdownMenuSubContentProps,
		DropdownMenuSubContentSlots
	>
	shortcut?: ComponentConfig<
		DropdownMenuShortcutProps,
		DropdownMenuShortcutSlots
	>
}
