import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { useState } from 'react'
import { tv } from 'tailwind-variants'

import type { ConfirmProps } from './confirm.types'

import { Button } from '@/components/button'

const styles = tv({
	slots: {
		actions: 't:flex t:flex-col-reverse t:gap-2 t:sm:flex-row t:sm:justify-end',
		content:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:data-[state=closed]:zoom-out-95 t:data-[state=open]:zoom-in-95 t:fixed t:top-[50%] t:left-[50%] t:z-50 t:grid t:w-full t:max-w-lg t:translate-x-[-50%] t:translate-y-[-50%] t:gap-4 t:border t:bg-dialog t:p-6 t:shadow-lg t:duration-200 t:data-[state=closed]:animate-out t:data-[state=open]:animate-in t:sm:rounded-lg',
		description: 't:text-muted-foreground t:text-sm',
		overlay:
			't:data-[state=closed]:fade-out-0 t:data-[state=open]:fade-in-0 t:fixed t:inset-0 t:z-50 t:bg-black/80 t:data-[state=closed]:animate-out t:data-[state=open]:animate-in',
		title: 't:font-semibold t:text-lg',
	},
})

export function Confirm({
	open,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	confirmProps,
	cancelProps,
	onConfirm,
	onCancel,
	onClose,
}: ConfirmProps) {
	const [confirmLoading, setConfirmLoading] = useState(false)
	const [cancelLoading, setCancelLoading] = useState(false)

	const {
		content,
		overlay,
		title: titleClass,
		description: descriptionClass,
		actions,
	} = styles()

	const handleConfirm = async () => {
		setConfirmLoading(true)
		try {
			await Promise.resolve(onConfirm?.())
		} finally {
			setConfirmLoading(false)
		}
	}

	const handleCancel = async () => {
		setCancelLoading(true)
		try {
			await Promise.resolve(onCancel?.())
		} finally {
			setCancelLoading(false)
		}
	}

	const handleClose = () => {
		if (!open) {
			return
		}

		onClose?.()
	}

	return (
		<AlertDialogPrimitive.Root
			onOpenChange={handleClose}
			open={open}
		>
			<AlertDialogPrimitive.Portal>
				<AlertDialogPrimitive.Overlay className={overlay()} />
				<AlertDialogPrimitive.Content className={content()}>
					<AlertDialogPrimitive.Title className={titleClass()}>
						{title}
					</AlertDialogPrimitive.Title>
					<AlertDialogPrimitive.Description className={descriptionClass()}>
						{description}
					</AlertDialogPrimitive.Description>
					<div className={actions()}>
						<AlertDialogPrimitive.Cancel asChild>
							<Button
								{...cancelProps}
								loading={cancelLoading}
								onClick={handleCancel}
								variant={cancelProps?.variant ?? 'outline'}
							>
								{cancelText}
							</Button>
						</AlertDialogPrimitive.Cancel>
						<AlertDialogPrimitive.Action asChild>
							<Button
								{...confirmProps}
								loading={confirmLoading}
								onClick={handleConfirm}
							>
								{confirmText}
							</Button>
						</AlertDialogPrimitive.Action>
					</div>
				</AlertDialogPrimitive.Content>
			</AlertDialogPrimitive.Portal>
		</AlertDialogPrimitive.Root>
	)
}
