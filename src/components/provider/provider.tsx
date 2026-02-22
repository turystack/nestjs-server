import type React from 'react'

import { TuryStackContext } from './provider.context'
import type { TuryStackProviderProps } from './provider.types'

export function TuryStackProvider({
	children,
	...props
}: TuryStackProviderProps & {
	children: React.ReactNode
}) {
	return (
		<TuryStackContext.Provider value={props}>
			{children}
		</TuryStackContext.Provider>
	)
}
