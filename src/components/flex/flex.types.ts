export type FlexSlots = 'root'

export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse'

export type FlexJustify =
	| 'start'
	| 'end'
	| 'center'
	| 'between'
	| 'around'
	| 'evenly'

export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse'

export type FlexMinHeight = 'sm' | 'md' | 'lg' | 'screen'

export type FlexProps = {
	direction?: FlexDirection
	justify?: FlexJustify
	align?: FlexAlign
	gap?: FlexGap
	wrap?: FlexWrap
	inline?: boolean
	minHeight?: FlexMinHeight
}
