import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { TableProps } from './table.types'

import { Checkbox } from '@/components/checkbox'
import { LoadingOverlay } from '@/components/loading-overlay'
import { Pagination } from '@/components/pagination'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		body: '',
		cell: 't:px-4 t:py-3 t:text-sm',
		empty: 't:py-12 t:text-center t:text-muted-foreground t:text-sm',
		header: '',
		headerCell:
			't:px-4 t:py-3 t:text-left t:font-medium t:text-muted-foreground t:text-xs t:uppercase t:tracking-wide',
		root: 't:relative t:w-full t:overflow-auto t:rounded-md t:border',
		row: 't:border-b t:transition-colors t:hover:bg-muted/50',
		selection: '',
		table: 't:w-full t:caption-bottom t:text-sm',
	},
	variants: {
		align: {
			center: {
				cell: 't:text-center',
				headerCell: 't:text-center',
			},
			left: {},
			right: {
				cell: 't:text-right',
				headerCell: 't:text-right',
			},
		},
		clickable: {
			true: {
				row: 't:cursor-pointer',
			},
		},
		selected: {
			true: {
				row: 't:bg-muted/30',
			},
		},
		sorter: {
			true: {
				headerCell: 't:cursor-pointer t:select-none t:hover:text-foreground',
			},
		},
	},
})

function SortIcon({ columnKey, sort }: { columnKey: string; sort?: string }) {
	if (!sort || (sort !== columnKey && sort !== `-${columnKey}`)) {
		return <ArrowUpDown className="t:ml-1 t:inline-block t:h-3 t:w-3" />
	}
	if (sort === columnKey) {
		return <ArrowUp className="t:ml-1 t:inline-block t:h-3 t:w-3" />
	}
	return <ArrowDown className="t:ml-1 t:inline-block t:h-3 t:w-3" />
}

export function Table<T extends object>({
	columns,
	items = [],
	itemKey,
	selection = 'none',
	selectedKeys: selectedKeysProp,
	defaultSelectedKeys,
	pagination,
	sort,
	hidePagination = false,
	loading = false,
	emptySection,
	onRowClick,
	onSelectionChange,
	onSortChange,
}: TableProps<T>) {
	const [internalKeys, setInternalKeys] = useState<string[]>(
		selectedKeysProp ?? defaultSelectedKeys ?? [],
	)

	const isControlled = selectedKeysProp !== undefined
	const selectedKeys = isControlled ? selectedKeysProp : internalKeys

	const state = useInternalState()
	const config = state?.components?.table
	const translations = state?.translations?.table

	useEffect(() => {
		if (isControlled && selectedKeysProp) {
			setInternalKeys(selectedKeysProp)
		}
	}, [
		isControlled,
		selectedKeysProp,
	])

	const {
		root,
		table,
		header,
		headerCell,
		body,
		cell,
		empty,
		selection: selectionClass,
	} = styles({
		clickable: !!onRowClick,
	})

	const visibleColumns = columns.filter((col) => !col.hide)
	const hasSelection = selection === 'multiple'

	const allKeys = items.map((item) => String(item[itemKey]))
	const allSelected =
		allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k))

	function updateSelection(next: string[]) {
		if (!isControlled) {
			setInternalKeys(next)
		}
		onSelectionChange?.(next)
	}

	function handleSelectAll(checked: boolean) {
		const next = checked ? allKeys : []
		updateSelection(next)
	}

	function handleSelectRow(key: string, checked: boolean) {
		const next = checked
			? [
					...selectedKeys,
					key,
				]
			: selectedKeys.filter((k) => k !== key)
		updateSelection(next)
	}

	function handleSort(columnKey: string) {
		if (!sort || sort === `-${columnKey}`) {
			onSortChange?.(columnKey)
		} else if (sort === columnKey) {
			onSortChange?.(`-${columnKey}`)
		} else {
			onSortChange?.(columnKey)
		}
	}

	return (
		<div className="t:space-y-2">
			<div className={cn(root(), config?.classNames?.root)}>
				<LoadingOverlay visible={loading} />
				<table className={table()}>
					<thead className={cn(header(), config?.classNames?.header)}>
						<tr>
							{hasSelection && (
								<th
									className={cn(
										headerCell(),
										selectionClass(),
										config?.classNames?.selection,
										't:w-10',
									)}
								>
									<Checkbox
										checked={allSelected}
										onChange={handleSelectAll}
									/>
								</th>
							)}
							{visibleColumns.map((col) => (
								<th
									className={cn(
										styles({
											align: col.align,
											sorter: col.sorter,
										}).headerCell(),
										config?.classNames?.headerCell,
									)}
									key={col.key}
									onClick={col.sorter ? () => handleSort(col.key) : undefined}
									style={
										col.width
											? {
													width: col.width,
												}
											: undefined
									}
								>
									{col.label}
									{col.sorter && (
										<SortIcon
											columnKey={col.key}
											sort={sort}
										/>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody className={cn(body(), config?.classNames?.body)}>
						{items.length === 0 ? (
							<tr>
								<td
									className={cn(empty(), config?.classNames?.empty)}
									colSpan={visibleColumns.length + (hasSelection ? 1 : 0)}
								>
									{emptySection ?? translations?.noData}
								</td>
							</tr>
						) : (
							items.map((item, index) => {
								const key = String(item[itemKey])
								const isSelected = selectedKeys.includes(key)

								return (
									<tr
										className={cn(
											styles({
												selected: isSelected,
											}).row(),
											config?.classNames?.row,
										)}
										key={key}
										onClick={() => onRowClick?.(item)}
									>
										{hasSelection && (
											<td
												className={cn(
													cell(),
													config?.classNames?.selection,
													't:w-10',
												)}
											>
												<Checkbox
													checked={isSelected}
													onChange={(c) => handleSelectRow(key, c)}
												/>
											</td>
										)}
										{visibleColumns.map((col) => (
											<td
												className={cn(
													styles({
														align: col.align,
													}).cell(),
													config?.classNames?.cell,
												)}
												key={col.key}
											>
												{col.selector
													? col.selector(item, index)
													: String(
															(item as Record<string, unknown>)[col.key] ?? '',
														)}
											</td>
										))}
									</tr>
								)
							})
						)}
					</tbody>
				</table>
			</div>
			{!hidePagination && pagination && <Pagination {...pagination} />}
		</div>
	)
}
