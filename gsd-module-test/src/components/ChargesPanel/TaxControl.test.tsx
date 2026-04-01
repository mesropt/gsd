import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect } from 'vitest'
import { useBillStore } from '@/store/useBillStore'
import { TaxControl } from './TaxControl'

describe('TaxControl', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  it('TAX-01 percent mode: typing value sets store tax.value as float', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.type(screen.getByLabelText('Tax percentage'), '8.5')
    expect(useBillStore.getState().tax.value).toBe(8.5)
    expect(useBillStore.getState().tax.mode).toBe('percent')
  })

  it('TAX-01 dollar mode: typing value sets store tax.value as integer cents', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.click(screen.getByRole('button', { name: '$' }))
    await user.type(screen.getByLabelText('Tax amount'), '12.50')
    expect(useBillStore.getState().tax.value).toBe(1250)
    expect(useBillStore.getState().tax.mode).toBe('amount')
  })

  it('TAX-01 switching mode clears input and resets value to 0', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.type(screen.getByLabelText('Tax percentage'), '10')
    await user.click(screen.getByRole('button', { name: '$' }))
    expect(useBillStore.getState().tax.value).toBe(0)
    expect(screen.getByLabelText('Tax amount')).toHaveValue('')
  })

  it('TAX-01 non-numeric input shows validation error', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.type(screen.getByLabelText('Tax percentage'), 'abc')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number')
  })

  it('TAX-01 empty input does not show error', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    const input = screen.getByLabelText('Tax percentage')
    await user.type(input, 'abc')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.clear(input)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('TAX-02 equal split button sets splitMethod to equal', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.click(screen.getByRole('button', { name: 'Proportional' }))
    await user.click(screen.getByRole('button', { name: 'Equal' }))
    expect(useBillStore.getState().tax.splitMethod).toBe('equal')
  })

  it('TAX-03 proportional split button sets splitMethod to proportional', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.click(screen.getByRole('button', { name: 'Proportional' }))
    expect(useBillStore.getState().tax.splitMethod).toBe('proportional')
  })

  it('TAX-01 dollar mode renders $ prefix and aria-label Tax amount', async () => {
    const user = userEvent.setup()
    render(<TaxControl />)
    await user.click(screen.getByRole('button', { name: '$' }))
    expect(screen.getByLabelText('Tax amount')).toBeInTheDocument()
    expect(screen.getAllByText('$').length).toBeGreaterThan(0)
  })
})
