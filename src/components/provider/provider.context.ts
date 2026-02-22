import { createContext, useContext } from 'react'

import type { TuryStackProviderProps } from './provider.types'

export const TuryStackContext = createContext<
	TuryStackProviderProps | undefined
>(undefined)

export function useTuryStack() {
	return useContext(TuryStackContext)
}
