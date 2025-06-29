export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
}

export const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
}

export const getMonthYearLabel = (year: number, month: number): string => {
    const date = new Date(year, month)
    return date.toLocaleString('default', {month: 'long', year: 'numeric'})
}