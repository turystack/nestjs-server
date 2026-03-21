import { Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import type { UploaderHandlerResponse, UploaderProps } from './uploader.types'

import { Button } from '@/components/button'
import { useInternalState } from '@/components/provider/provider.context'

const styles = tv({
	slots: {
		fileItem:
			't:flex t:items-center t:justify-between t:gap-3 t:rounded-md t:border t:px-3 t:py-2 t:text-sm',
		fileList: 't:mt-3 t:space-y-2',
		fileName: 't:flex-1 t:truncate t:text-sm',
		icon: 't:h-8 t:w-8 t:text-muted-foreground',
		progress: 't:h-1.5 t:w-full t:overflow-hidden t:rounded-full t:bg-muted',
		progressBar: 't:h-full t:bg-primary t:transition-all',
		remove: '',
		root: 't:flex t:cursor-pointer t:flex-col t:items-center t:justify-center t:gap-2 t:rounded-md t:border-2 t:border-dashed t:p-6 t:text-center t:transition-colors t:hover:border-primary/50 t:hover:bg-muted/30',
	},
	variants: {
		disabled: {
			true: {
				root: 't:pointer-events-none t:opacity-50',
			},
		},
		dragging: {
			true: {
				root: 't:border-primary t:bg-muted/30',
			},
		},
	},
})

type FileState = {
	file: File
	progress: number
	status: 'pending' | 'uploading' | 'done' | 'error'
	response?: UploaderHandlerResponse
}

export function Uploader({
	accept,
	maxFiles,
	maxFileSize,
	disabled,
	handler,
	onUpload,
}: UploaderProps) {
	const state = useInternalState()
	const translations = state?.translations?.uploader

	const [files, setFiles] = useState<FileState[]>([])
	const [dragging, setDragging] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const { root, icon, fileList, fileItem, fileName, progress, progressBar } =
		styles({
			disabled: !!disabled,
			dragging,
		})

	async function uploadFile(file: File, index: number) {
		setFiles((prev) =>
			prev.map((f, i) =>
				i === index
					? {
							...f,
							progress: 0,
							status: 'uploading',
						}
					: f,
			),
		)

		try {
			const response = await handler(file.name)

			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest()
				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const pct = Math.round((e.loaded / e.total) * 100)
						setFiles((prev) =>
							prev.map((f, i) =>
								i === index
									? {
											...f,
											progress: pct,
										}
									: f,
							),
						)
					}
				})
				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve()
					} else {
						reject(new Error(`Upload failed: ${xhr.status}`))
					}
				})
				xhr.addEventListener('error', () => reject(new Error('Upload error')))
				xhr.open('PUT', response.fileNameSigned)
				xhr.setRequestHeader('Content-Type', file.type)
				xhr.send(file)
			})

			setFiles((prev) =>
				prev.map((f, i) =>
					i === index
						? {
								...f,
								progress: 100,
								response,
								status: 'done',
							}
						: f,
				),
			)

			const doneFiles = files
				.map((f, i) =>
					i === index
						? {
								...f,
								response,
							}
						: f,
				)
				.filter((f) => f.status === 'done')
				.map((f) => f.response!)

			;(onUpload as (r: UploaderHandlerResponse[], idx: number) => void)?.(
				doneFiles,
				index,
			)
		} catch {
			setFiles((prev) =>
				prev.map((f, i) =>
					i === index
						? {
								...f,
								progress: 0,
								status: 'error',
							}
						: f,
				),
			)
		}
	}

	function handleFiles(selected: File[]) {
		const filtered = maxFileSize
			? selected.filter((f) => f.size <= maxFileSize)
			: selected

		const limited = maxFiles
			? filtered.slice(0, maxFiles - files.length)
			: filtered

		const newStates: FileState[] = limited.map((file) => ({
			file,
			progress: 0,
			status: 'pending',
		}))

		setFiles((prev) => {
			const next = [
				...prev,
				...newStates,
			]
			newStates.forEach((_, i) => {
				uploadFile(limited[i], prev.length + i)
			})
			return next
		})
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault()
		setDragging(false)
		if (disabled) {
			return
		}
		const dropped = Array.from(e.dataTransfer.files)
		handleFiles(dropped)
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = Array.from(e.target.files ?? [])
		handleFiles(selected)
		e.target.value = ''
	}

	function removeFile(index: number) {
		setFiles((prev) => prev.filter((_, i) => i !== index))
	}

	return (
		<div>
			<div
				className={root()}
				onClick={() => inputRef.current?.click()}
				onDragLeave={() => setDragging(false)}
				onDragOver={(e) => {
					e.preventDefault()
					setDragging(true)
				}}
				onDrop={handleDrop}
			>
				<Upload className={icon()} />
				<p className="t:font-medium t:text-sm">{translations?.clickOrDrag}</p>
				{(maxFileSize || accept) && (
					<p className="t:text-muted-foreground t:text-xs">
						{accept && (translations?.accepted ?? accept)}
						{accept && maxFileSize && ' · '}
						{maxFileSize &&
							(translations?.maxSize ??
								`${(maxFileSize / 1024 / 1024).toFixed(1)} MB`)}
					</p>
				)}
				<input
					accept={accept}
					className="t:hidden"
					disabled={disabled}
					multiple={!maxFiles || maxFiles > 1}
					onChange={handleChange}
					ref={inputRef}
					type="file"
				/>
			</div>

			{files.length > 0 && (
				<ul className={fileList()}>
					{files.map((f, i) => (
						<li
							className={fileItem()}
							key={`${f.file.name}-${i}`}
						>
							<span className={fileName()}>{f.file.name}</span>
							<div className="t:flex t:flex-1 t:flex-col t:gap-1">
								{f.status === 'uploading' && (
									<div className={progress()}>
										<div
											className={progressBar()}
											style={{
												width: `${f.progress}%`,
											}}
										/>
									</div>
								)}
								{f.status === 'error' && (
									<span className="t:text-destructive t:text-xs">
										{translations?.errorUploading}
									</span>
								)}
							</div>
							<Button
								onClick={() => removeFile(i)}
								size="icon-sm"
								variant="ghost"
							>
								<X className="t:h-3 t:w-3" />
							</Button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
