export const formatCurrency = (amountInCents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountInCents / 100)
}

export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d]/g, '')
  return parseInt(cleanValue || '0', 10)
}

export const formatCurrencyInput = (value: string): string => {
  const cents = parseCurrency(value)
  return formatCurrency(cents)
}
