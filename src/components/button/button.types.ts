export type ButtonSlots = 'root' | 'loading' | 'leftSection' | 'rightSection'

export type ButtonType = 'button' | 'submit' | 'reset'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg'

export type ButtonVariant =
	| 'default'
	| 'destructive'
	| 'outline'
	| 'dashed'
	| 'secondary'
	| 'ghost'
	| 'link'

export type ButtonProps = {
	form?: string
	type?: ButtonType
	size?: ButtonSize
	variant?: ButtonVariant
	leftSection?: React.ReactNode
	rightSection?: React.ReactNode
	block?: boolean
	loading?: boolean
	disabled?: boolean
	asChild?: boolean
	onClick?: React.MouseEventHandler<HTMLButtonElement>
}
