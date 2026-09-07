export type Paired = 'ETH' | 'USDG' | 'cbBTC'
export const DEMO_LAUNCH_FEE = 0.0005
export const DEMO_BASE_FEE = 1

export function demoQuote(creatorTax: number, devBuy: number, paired: Paired) {
  const tax = Number.isFinite(creatorTax) ? Math.min(10, Math.max(0, creatorTax)) : 0
  const buy = Number.isFinite(devBuy) ? Math.max(0, devBuy) : 0
  const eth = DEMO_LAUNCH_FEE + (paired === 'ETH' ? buy : 0)
  const format = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 8, useGrouping: false })
  return { tax, totalFee: DEMO_BASE_FEE + tax, buy, total: `${format(eth)} ETH${paired !== 'ETH' && buy > 0 ? ` + ${format(buy)} ${paired}` : ''}` }
}
