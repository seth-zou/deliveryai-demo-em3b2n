import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const currencyCodes = ['CNY', 'USD', 'EUR', 'JPY', 'HKD'] as const
export type CurrencyCode = typeof currencyCodes[number]

const currencyRates: Record<CurrencyCode, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 21,
  HKD: 1.08,
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 所有业务金额均以人民币基准值保存；此处仅按演示汇率转换展示，不影响订单计算。
 */
export const money = (value: number, currency: CurrencyCode = 'CNY', locale = 'zh-CN') => new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
}).format(value * currencyRates[currency])

// crypto.randomUUID 仅在安全上下文（https / localhost）可用；
// 通过局域网 IP 或 file:// 打开时它是 undefined，直接调用会抛错。
// 演示为纯前端应用，需在任意来源下都能生成唯一 id，故降级为 Math.random 方案。
export function uid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    // 忽略：不可用时走下方降级分支
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
