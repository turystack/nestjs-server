import { tv } from 'tailwind-variants'

export const styles = tv({
	defaultVariants: {
		hasLeft: false,
		hasRight: false,
		size: 'md',
	},
	slots: {
		input:
			't:flex t:w-full t:rounded-md t:border t:border-input t:bg-background t:px-3 t:py-2 t:text-base t:ring-offset-background t:file:border-0 t:file:bg-transparent t:file:font-medium t:file:text-foreground t:file:text-sm t:placeholder:text-muted-foreground t:focus-visible:outline-none t:focus-visible:ring-2 t:focus-visible:ring-ring t:focus-visible:ring-offset-2 t:disabled:cursor-not-allowed t:disabled:opacity-50 t:md:text-sm',
		leftSection:
			't:pointer-events-none t:absolute t:inset-y-0 t:left-0 t:flex t:items-center t:pl-3',
		loader: 't:pointer-events-none t:size-4',
		rightSection:
			't:absolute t:inset-y-0 t:right-0 t:flex t:items-center t:gap-2 t:pr-3',
		root: 't:relative t:w-full',
	},
	variants: {
		hasLeft: {
			true: {
				input: 't:pl-10',
			},
		},
		hasRight: {
			true: {
				input: 't:pr-10',
			},
		},
		size: {
			lg: {
				input: 't:h-11',
			},
			md: {
				input: 't:h-10',
			},
			sm: {
				input: 't:h-9 t:text-sm',
			},
		},
	},
})
