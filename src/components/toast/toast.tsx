import {
	CircleCheck,
	Info,
	LoaderCircle,
	OctagonX,
	TriangleAlert,
} from 'lucide-react'
import { Toaster as Sonner, toast as sonnerToast } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function ToastContainer({ theme, ...props }: ToasterProps) {
	return (
		<Sonner
			className="t:toaster t:group"
			icons={{
				error: <OctagonX className="t:h-4 t:w-4" />,
				info: <Info className="t:h-4 t:w-4" />,
				loading: <LoaderCircle className="t:h-4 t:w-4 t:animate-spin" />,
				success: <CircleCheck className="t:h-4 t:w-4" />,
				warning: <TriangleAlert className="t:h-4 t:w-4" />,
			}}
			theme={theme}
			toastOptions={{
				classNames: {
					actionButton:
						't:group-[.toast]:bg-primary t:group-[.toast]:text-primary-foreground',
					cancelButton:
						't:group-[.toast]:bg-muted t:group-[.toast]:text-muted-foreground',
					description: 't:group-[.toast]:text-muted-foreground',
					error: 't:border-l-4 t:border-l-red-500',
					info: 't:border-l-4 t:border-l-blue-500',
					success: 't:border-l-4 t:border-l-green-500',
					toast:
						't:group t:toast t:group-[.toaster]:bg-background t:group-[.toaster]:text-foreground t:group-[.toaster]:border-border t:group-[.toaster]:shadow-lg',
					warning: 't:border-l-4 t:border-l-yellow-500',
				},
			}}
			{...props}
		/>
	)
}

export { sonnerToast as toast }
