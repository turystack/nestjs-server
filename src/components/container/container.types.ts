export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export type ContainerTextAlign = 'left' | 'center' | 'right'

export type ContainerProps = {
	centered?: boolean
	maxWidth?: ContainerMaxWidth
	textAlign?: ContainerTextAlign
}
