import { Loader2 } from 'lucide-react'
import { tv } from 'tailwind-variants'

import type { LoadingOverlayProps } from './loading-overlay.types'

const styles = tv({
	defaultVariants: {
		visible: false,
	},
	slots: {
		loader: 't:size-8 t:animate-spin t:text-muted-foreground',
		root: 't:absolute t:inset-0 t:z-50 t:items-center t:justify-center t:bg-background/80',
	},
	variants: {
		visible: {
			false: {
				root: 't:hidden',
			},
			true: {
				root: 't:flex',
			},
		},
	},
})

export function LoadingOverlay({ visible = false }: LoadingOverlayProps) {
	const { root, loader } = styles({
		visible,
	})

	return (
		<div className={root()}>
			<Loader2 className={loader()} />
		</div>
	)
}
