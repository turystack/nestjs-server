import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { tv } from 'tailwind-variants'

import type { PaginationProps } from './pagination.types'

import { Button } from '@/components/button'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		actions: 't:flex t:items-center t:gap-1',
		root: 't:flex t:items-center t:justify-between t:gap-4',
		rowsPerPage:
			't:flex t:items-center t:gap-2 t:text-muted-foreground t:text-sm',
		rowsSelect: 't:relative',
		rowsSelectIcon:
			't:pointer-events-none t:absolute t:inset-y-0 t:right-2 t:flex t:items-center',
		rowsSelectNative:
			't:h-8 t:w-full t:cursor-pointer t:appearance-none t:rounded-md t:border t:border-input t:bg-background t:pr-8 t:pl-2 t:text-sm t:focus:outline-none t:focus:ring-2 t:focus:ring-ring',
	},
})

const PAGE_SIZE_OPTIONS = [
	10,
	20,
	50,
	100,
]

export function Pagination(props: PaginationProps) {
	const state = useInternalState()
	const config = state?.components?.pagination
	const translations = state?.translations?.pagination
	const {
		root,
		rowsPerPage,
		rowsSelect,
		rowsSelectNative,
		rowsSelectIcon,
		actions,
	} = styles()

	if (props.mode === 'offset') {
		const {
			page,
			rowsPerPage: rpp,
			total,
			onPageChange,
			onRowsPerPageChange,
		} = props
		const totalPages = Math.ceil(total / rpp)
		const hasPrev = page > 1
		const hasNext = page < totalPages

		return (
			<div className={cn(root(), config?.classNames?.root)}>
				<div className={cn(rowsPerPage(), config?.classNames?.rowsPerPage)}>
					<span>{translations?.rowsPerPage}</span>
					<div className={rowsSelect()}>
						<select
							className={rowsSelectNative()}
							onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
							value={rpp}
						>
							{PAGE_SIZE_OPTIONS.map((opt) => (
								<option
									key={opt}
									value={opt}
								>
									{opt}
								</option>
							))}
						</select>
						<div className={rowsSelectIcon()}>
							<ChevronDown className="t:size-3.5 t:text-muted-foreground" />
						</div>
					</div>
					<span>
						{(page - 1) * rpp + 1}–{Math.min(page * rpp, total)} {translations?.of} {total}
					</span>
				</div>
				<div className={actions()}>
					<Button
						disabled={!hasPrev}
						onClick={() => onPageChange(page - 1)}
						size="icon-sm"
						variant="ghost"
					>
						<ChevronLeft />
					</Button>
					<Button
						disabled={!hasNext}
						onClick={() => onPageChange(page + 1)}
						size="icon-sm"
						variant="ghost"
					>
						<ChevronRight />
					</Button>
				</div>
			</div>
		)
	}

	const {
		rowsPerPage: rpp,
		hasPreviousPage,
		hasNextPage,
		onPreviousPage,
		onNextPage,
		onRowsPerPageChange,
	} = props

	return (
		<div className={cn(root(), config?.classNames?.root)}>
			<div className={cn(rowsPerPage(), config?.classNames?.rowsPerPage)}>
				<span>{translations?.rowsPerPage}</span>
				<div className={rowsSelect()}>
					<select
						className={rowsSelectNative()}
						onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
						value={rpp}
					>
						{PAGE_SIZE_OPTIONS.map((opt) => (
							<option
								key={opt}
								value={opt}
							>
								{opt}
							</option>
						))}
					</select>
					<div className={rowsSelectIcon()}>
						<ChevronDown className="t:size-3.5 t:text-muted-foreground" />
					</div>
				</div>
			</div>
			<div className={actions()}>
				<Button
					disabled={!hasPreviousPage}
					onClick={onPreviousPage}
					size="icon-sm"
					variant="ghost"
				>
					<ChevronLeft />
				</Button>
				<Button
					disabled={!hasNextPage}
					onClick={onNextPage}
					size="icon-sm"
					variant="ghost"
				>
					<ChevronRight />
				</Button>
			</div>
		</div>
	)
}
