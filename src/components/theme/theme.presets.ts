import type { ThemeFont, ThemeRadius } from './theme.types'

export const FONT_MAP: Record<ThemeFont, string> = {
	mono: '"JetBrains Mono", monospace',
	sans: '"Inter", sans-serif',
	serif: '"Georgia", "Times New Roman", serif',
}

export const RADIUS_MAP: Record<ThemeRadius, string> = {
	lg: '0.625rem',
	md: '0.375rem',
	none: '0px',
	sm: '0.25rem',
}
