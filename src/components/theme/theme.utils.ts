import { FONT_MAP, RADIUS_MAP } from './theme.presets'
import type { ThemeProps } from './theme.types'

export function resolveTheme(theme: ThemeProps): ThemeProps {
	return {
		font: theme.font,
		radius: theme.radius,
	}
}

export function applyTheme(
	theme: ThemeProps,
	_isDark: boolean,
): Record<string, string> {
	const resolved = resolveTheme(theme)
	const vars: Record<string, string> = {}

	if (resolved.font) {
		vars['--font-sans'] = FONT_MAP[resolved.font]
	}

	if (resolved.radius) {
		vars['--t-radius'] = RADIUS_MAP[resolved.radius]
	}

	return vars
}

export function applyThemeToDocument(theme: ThemeProps): void {
	const root = document.documentElement
	const isDark = root.classList.contains('dark')
	const vars = applyTheme(theme, isDark)

	for (const [key, value] of Object.entries(vars)) {
		root.style.setProperty(key, value)
	}
}

export const ALL_THEME_CSS_VARS = [
	'--t-accent',
	'--t-accent-foreground',
	'--t-background',
	'--t-border',
	'--t-card',
	'--t-card-foreground',
	'--t-dialog',
	'--t-dialog-foreground',
	'--t-foreground',
	'--t-input',
	'--t-muted',
	'--t-muted-foreground',
	'--t-popover',
	'--t-popover-foreground',
	'--t-secondary',
	'--t-secondary-foreground',
	'--t-sheet',
	'--t-sheet-foreground',
	'--t-sidebar',
	'--t-sidebar-accent',
	'--t-sidebar-accent-foreground',
	'--t-sidebar-border',
	'--t-sidebar-foreground',
	'--t-sidebar-primary',
	'--t-sidebar-primary-foreground',
	'--t-sidebar-ring',
	'--t-radius',
	'--font-sans',
] as const
