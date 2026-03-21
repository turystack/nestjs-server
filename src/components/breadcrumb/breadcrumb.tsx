import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type {
	BreadcrumbEllipsisProps,
	BreadcrumbItemProps,
	BreadcrumbLinkProps,
	BreadcrumbListProps,
	BreadcrumbPageProps,
	BreadcrumbProps,
	BreadcrumbSeparatorProps,
} from './breadcrumb.types'

import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		ellipsis: 't:flex t:h-9 t:w-9 t:items-center t:justify-center',
		ellipsisIcon: 't:h-4 t:w-4',
		item: 't:inline-flex t:items-center t:gap-1.5',
		link: 't:cursor-pointer t:transition-colors t:hover:text-foreground',
		list: 't:flex t:flex-wrap t:items-center t:gap-1.5 t:break-words t:text-muted-foreground t:text-sm t:sm:gap-2.5',
		page: 't:font-normal t:text-foreground',
		root: '',
		separator: 't:[&>svg]:h-3.5 t:[&>svg]:w-3.5',
	},
})

function Root({ children }: PropsWithChildren<BreadcrumbProps>) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.default

	const { root } = styles()

	return (
		<nav
			aria-label="breadcrumb"
			className={cn(root(), config?.classNames?.root)}
		>
			{children}
		</nav>
	)
}

function List({ children }: PropsWithChildren<BreadcrumbListProps>) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.list

	const { list } = styles()

	return <ol className={cn(list(), config?.classNames?.root)}>{children}</ol>
}

function Item({ children }: PropsWithChildren<BreadcrumbItemProps>) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.item

	const { item } = styles()

	return <li className={cn(item(), config?.classNames?.root)}>{children}</li>
}

function Link({
	asChild,
	href,
	children,
}: PropsWithChildren<BreadcrumbLinkProps>) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.link
	const defaults = config?.defaultProps

	const resolvedAsChild = asChild ?? defaults?.asChild ?? false
	const Comp = resolvedAsChild ? Slot : 'a'

	const { link } = styles()

	return (
		<Comp
			className={cn(link(), config?.classNames?.root)}
			href={resolvedAsChild ? undefined : href}
		>
			{children}
		</Comp>
	)
}

function Page({ children }: PropsWithChildren<BreadcrumbPageProps>) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.page

	const { page } = styles()

	return (
		<span
			aria-current="page"
			aria-disabled="true"
			className={cn(page(), config?.classNames?.root)}
		>
			{children}
		</span>
	)
}

function Separator({ children }: PropsWithChildren<BreadcrumbSeparatorProps>) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.separator

	const { separator } = styles()

	return (
		<li
			aria-hidden="true"
			className={cn(separator(), config?.classNames?.root)}
			role="presentation"
		>
			{children ?? <ChevronRight />}
		</li>
	)
}

function Ellipsis(_props: BreadcrumbEllipsisProps) {
	const state = useInternalState()
	const config = state?.components?.breadcrumb?.ellipsis

	const { ellipsis, ellipsisIcon } = styles()

	return (
		<span
			aria-hidden="true"
			className={cn(ellipsis(), config?.classNames?.root)}
			role="presentation"
		>
			<MoreHorizontal
				className={cn(ellipsisIcon(), config?.classNames?.icon)}
			/>
			</span>
	)
}

export const Breadcrumb = Object.assign(Root, {
	Ellipsis,
	Item,
	Link,
	List,
	Page,
	Separator,
})
