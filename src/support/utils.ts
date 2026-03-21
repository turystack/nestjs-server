import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { createTV } from 'tailwind-variants'

const twMerge = extendTailwindMerge({
	prefix: 't',
})

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const tv = createTV({
	twMergeConfig: {
		prefix: 't',
	},
})
