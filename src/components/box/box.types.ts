export type BoxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type BoxBg = 'background' | 'muted' | 'card'

export type BoxRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type BoxWidth = 'auto' | 'full'

export type BoxMinHeight = 'sm' | 'md' | 'lg' | 'screen'

export type BoxPosition = 'static' | 'relative' | 'absolute'

export type BoxOverflow = 'hidden' | 'visible' | 'auto'

export type BoxTextAlign = 'left' | 'center' | 'right'

export type BoxProps = {
	bg?: BoxBg
	grow?: boolean
	minHeight?: BoxMinHeight
	overflow?: BoxOverflow
	padding?: BoxPadding
	paddingX?: BoxPadding
	paddingY?: BoxPadding
	position?: BoxPosition
	rounded?: BoxRounded
	textAlign?: BoxTextAlign
	width?: BoxWidth
}
