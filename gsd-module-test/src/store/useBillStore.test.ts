import { describe, it, expect, beforeEach } from 'vitest'
import { useBillStore } from './useBillStore'

// Reset store before each test to ensure isolation
beforeEach(() => {
  useBillStore.getState().resetBill()
})

describe('initial state', () => {
  it('starts with empty people array', () => {
    expect(useBillStore.getState().people).toEqual([])
  })

  it('starts with empty items array', () => {
    expect(useBillStore.getState().items).toEqual([])
  })

  it('starts with tip mode percent, value 0, equal split', () => {
    expect(useBillStore.getState().tip).toEqual({
      mode: 'percent',
      value: 0,
      splitMethod: 'equal',
    })
  })

  it('starts with tax mode percent, value 0, equal split', () => {
    expect(useBillStore.getState().tax).toEqual({
      mode: 'percent',
      value: 0,
      splitMethod: 'equal',
    })
  })
})

describe('addPerson', () => {
  it('adds a person with a UUID and the given name', () => {
    useBillStore.getState().addPerson('Sarah')
    const { people } = useBillStore.getState()
    expect(people).toHaveLength(1)
    expect(people[0].name).toBe('Sarah')
    expect(people[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('adds multiple people', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    expect(useBillStore.getState().people).toHaveLength(2)
  })
})

describe('removePerson', () => {
  it('removes the person with the given id', () => {
    useBillStore.getState().addPerson('Alice')
    const id = useBillStore.getState().people[0].id
    useBillStore.getState().removePerson(id)
    expect(useBillStore.getState().people).toHaveLength(0)
  })
})

describe('addItem', () => {
  it('adds an item with a UUID, label, price in cents, and empty assignedTo', () => {
    useBillStore.getState().addItem('Pizza', 1250)
    const { items } = useBillStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].label).toBe('Pizza')
    expect(items[0].price).toBe(1250)
    expect(items[0].assignedTo).toEqual([])
    expect(items[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('assignItem', () => {
  it('updates assignedTo for the given item id', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Salad', 800)
    const itemId = useBillStore.getState().items[0].id
    const personId = useBillStore.getState().people[0].id
    useBillStore.getState().assignItem(itemId, [personId])
    expect(useBillStore.getState().items[0].assignedTo).toEqual([personId])
  })
})

describe('resetBill', () => {
  it('resets all state to initial values', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Pizza', 1250)
    useBillStore.getState().setTip({ value: 18, splitMethod: 'proportional' })
    useBillStore.getState().resetBill()
    const state = useBillStore.getState()
    expect(state.people).toEqual([])
    expect(state.items).toEqual([])
    expect(state.tip).toEqual({ mode: 'percent', value: 0, splitMethod: 'equal' })
    expect(state.tax).toEqual({ mode: 'percent', value: 0, splitMethod: 'equal' })
  })
})

describe('setTip / setTax', () => {
  it('updates tip fields with partial config', () => {
    useBillStore.getState().setTip({ value: 20 })
    expect(useBillStore.getState().tip.value).toBe(20)
    expect(useBillStore.getState().tip.mode).toBe('percent') // unchanged
  })

  it('updates tax splitMethod', () => {
    useBillStore.getState().setTax({ splitMethod: 'proportional' })
    expect(useBillStore.getState().tax.splitMethod).toBe('proportional')
  })
})
