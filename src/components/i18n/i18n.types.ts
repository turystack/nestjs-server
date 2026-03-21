export type I18nTranslations = {
	select?: {
		empty?: string
		loadingMore?: string
	}
	phoneInput?: {
		searchCountry?: string
		noCountriesFound?: string
	}
	currencyInput?: {
		from?: string
		to?: string
		cancel?: string
		confirm?: string
		selectRange?: string
	}
	numberInput?: {
		from?: string
		to?: string
		cancel?: string
		confirm?: string
		selectRange?: string
	}
	uploader?: {
		clickOrDrag?: string
		accepted?: string
		maxSize?: string
		errorUploading?: string
	}
	alert?: {
		close?: string
	}
	label?: {
		required?: string
		optional?: string
	}
	table?: {
		noData?: string
	}
	confirm?: {
		confirm?: string
		cancel?: string
	}
	sidebar?: {
		toggle?: string
	}
	documentInput?: {
		cpf?: string
		cnpj?: string
		cpfPlaceholder?: string
		cnpjPlaceholder?: string
		cpfOrCnpjPlaceholder?: string
	}
	pagination?: {
		rowsPerPage?: string
		of?: string
	}
	passwordInput?: {
		veryWeak?: string
		weak?: string
		medium?: string
		strong?: string
		veryStrong?: string
	}
	dateInput?: {
		format?: string
	}
	dateRangeInput?: {
		format?: string
		separator?: string
	}
}

export type I18nProviderProps = {
	translations: I18nTranslations
}
