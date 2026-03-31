/**
 * src/types/index.ts
 *
 * Complete TypeScript type contract for the Expense Splitter app.
 * All monetary values (Item.price, ChargeConfig.value when mode='amount')
 * are stored as INTEGER CENTS — never floating-point dollars.
 */

export type SplitMethod = 'equal' | 'proportional'

export interface Person {
  /** Unique identifier — generated via crypto.randomUUID() */
  id: string
  name: string
}

export interface Item {
  /** Unique identifier — generated via crypto.randomUUID() */
  id: string
  label: string
  /**
   * Price in INTEGER CENTS (e.g., $12.50 is stored as 1250).
   * Never store floating-point dollars here. Use toCents() on input.
   */
  price: number
  /**
   * IDs of people this item is assigned to.
   * - Empty array []             → unassigned (warning shown in Phase 4)
   * - All person IDs             → shared equally among everyone
   * - Subset of person IDs       → shared among that subset
   * No magic "shared" string — use array contents to determine sharing.
   */
  assignedTo: string[]
}

export interface ChargeConfig {
  /** 'percent': value is 0-100 (e.g., 18 for 18%). 'amount': value is integer cents. */
  mode: 'percent' | 'amount'
  /** Percent (0-100) when mode='percent', integer cents when mode='amount'. */
  value: number
  splitMethod: SplitMethod
}

export interface AppState {
  people: Person[]
  items: Item[]
  tip: ChargeConfig
  tax: ChargeConfig
}

export interface AppActions {
  addPerson: (name: string) => void
  removePerson: (id: string) => void
  /** priceCents must be an integer (use toCents() before calling) */
  addItem: (label: string, priceCents: number) => void
  removeItem: (id: string) => void
  /** assignedTo is an array of person IDs; empty = unassigned */
  assignItem: (itemId: string, assignedTo: string[]) => void
  setTip: (config: Partial<ChargeConfig>) => void
  setTax: (config: Partial<ChargeConfig>) => void
  resetBill: () => void
}
