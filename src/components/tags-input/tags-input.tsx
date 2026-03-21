import { X } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { TagsInputProps } from './tags-input.types'

import { Badge } from '@/components/badge'
import { Input, type InputProps } from '@/components/input'
import { useInternalState } from '@/components/provider/provider.context'
import { cn } from '@/support/utils'

const styles = tv({
	slots: {
		input: '',
		root: 't:space-y-2',
		tag: 't:flex t:items-center t:gap-1',
		tagRemove: 't:flex t:items-center',
	},
})

export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
	(
		{
			value,
			defaultValue,
			maxTags,
			allowDuplicates,
			placeholder,
			size,
			disabled,
			loading,
			onChange,
		},
		ref,
	) => {
		const state = useInternalState()
		const config = state?.components?.tagsInput

		const resolvedAllowDuplicates =
			allowDuplicates ?? config?.defaultProps?.allowDuplicates ?? false

		const inputRef = useRef<HTMLInputElement>(null)
		const [tags, setTags] = useState<string[]>(value ?? defaultValue ?? [])
		const [inputValue, setInputValue] = useState('')

		const addTag = (val: string) => {
			if (!val.trim()) {
				return
			}

			if (!resolvedAllowDuplicates && tags.includes(val)) {
				return
			}

			if (maxTags !== undefined && tags.length >= maxTags) {
				return
			}

			const newTags = [
				...tags,
				val,
			]
			setTags(newTags)
			onChange?.(newTags)
			setInputValue('')
		}

		const removeTag = (index: number) => {
			const next = tags.filter((_, i) => i !== index)
			setTags(next)
			onChange?.(next)
		}

		const handleChange: InputProps['onChange'] = (val) => {
			setInputValue(val ?? '')
		}

		useEffect(() => {
			const el = inputRef.current
			if (!el) {
				return
			}

			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Enter' && !event.shiftKey) {
					event.preventDefault()
					addTag(inputValue)
				}
			}

			el.addEventListener('keydown', handleKeyDown)
			return () => el.removeEventListener('keydown', handleKeyDown)
		}, [
			inputValue,
			tags,
		])

		useEffect(() => {
			if (value !== undefined) {
				setTags(value)
			}
		}, [
			value,
		])

		const { root, tag, tagRemove } = styles()

		return (
			<div className={cn(root(), config?.classNames?.root)}>
				{tags.length > 0 && (
					<div className="t:flex t:flex-wrap t:gap-2">
						{tags.map((tagValue, index) => (
							<Badge
								key={tagValue}
								variant="secondary"
							>
								<div className={cn(tag(), config?.classNames?.tag)}>
									<span>{tagValue}</span>

									<button
										className={cn(tagRemove(), config?.classNames?.tagRemove)}
										onClick={() => removeTag(index)}
										type="button"
									>
										<X className="t:h-3 t:w-3" />
									</button>
								</div>
							</Badge>
						))}
					</div>
				)}

				<Input
					disabled={disabled}
					loading={loading}
					onChange={handleChange}
					placeholder={placeholder}
					ref={(node) => {
						;(
							inputRef as React.MutableRefObject<HTMLInputElement | null>
						).current = node
						if (typeof ref === 'function') {
							ref(node)
						} else if (ref) {
							;(
								ref as React.MutableRefObject<HTMLInputElement | null>
							).current = node
						}
					}}
					size={size}
					value={inputValue}
				/>
			</div>
		)
	},
)
