import { FONT_MAP, RADIUS_MAP } from './theme.presets'
import { THEME_STORAGE_KEY } from './theme.storage'
import type { ThemeProps } from './theme.types'

export function getThemeScript(defaultTheme?: ThemeProps): string {
	const fontMapJson = JSON.stringify(FONT_MAP)
	const radiusMapJson = JSON.stringify(RADIUS_MAP)
	const defaultThemeJson = JSON.stringify(defaultTheme ?? {})
	const storageKey = JSON.stringify(THEME_STORAGE_KEY)

	return `(function(){try{var F=${fontMapJson};var R=${radiusMapJson};var d=${defaultThemeJson};var s=localStorage.getItem(${storageKey});var t=s?JSON.parse(s):{};var m=Object.assign({},d,t);var root=document.documentElement;if(m.font)root.style.setProperty("--font-sans",F[m.font]);if(m.radius)root.style.setProperty("--t-radius",R[m.radius])}catch(e){}})();`
}
