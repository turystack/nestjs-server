export type ComponentClassNameSlots<T extends string> = Partial<
	Record<T, string>
>

export type ComponentDefaultProps<T extends object> = Partial<T>