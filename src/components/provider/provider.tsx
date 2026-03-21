import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { PropsWithChildren } from 'react'

import { TuryStackContext } from './provider.context'
import type { ProviderProps } from './provider.types'

import { ColorSchemeProvider } from '@/components/color-scheme/color-scheme'
import { ThemeProvider } from '@/components/theme/theme'
import { ToastContainer } from '@/components/toast'

export function Provider({
	children,
	defaultColorScheme = 'system',
	persistTheme,
	theme,
	...props
}: PropsWithChildren<ProviderProps>) {
	return (
		<TuryStackContext.Provider value={props}>
			<ColorSchemeProvider defaultColorScheme={defaultColorScheme}>
				<ThemeProvider
					defaultTheme={theme}
					persistTheme={persistTheme}
				>
					<TooltipPrimitive.Provider delayDuration={400}>
						<ToastContainer />
						{children}
					</TooltipPrimitive.Provider>
				</ThemeProvider>
			</ColorSchemeProvider>
		</TuryStackContext.Provider>
	)
}
