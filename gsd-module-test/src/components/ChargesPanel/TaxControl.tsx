import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'
import { toCents } from '@/lib/calculations'

export function TaxControl() {
  const tax = useBillStore((s) => s.tax)
  const setTax = useBillStore((s) => s.setTax)

  const [rawValue, setRawValue] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)

  function handleModeSwitch(mode: 'percent' | 'amount') {
    setRawValue('')
    setIsInvalid(false)
    setTax({ mode, value: 0 })
  }

  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setRawValue(val)
    if (val === '') {
      setIsInvalid(false)
      setTax({ value: 0 })
      return
    }
    const parsed = parseFloat(val)
    if (isNaN(parsed) || parsed < 0) {
      setIsInvalid(true)
    } else if (tax.mode === 'amount') {
      setIsInvalid(false)
      setTax({ value: toCents(parsed) })
    } else {
      setIsInvalid(false)
      setTax({ value: parsed })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium w-8">Tax</span>
        <Button
          variant={tax.mode === 'amount' ? 'default' : 'outline'}
          size="sm"
          className="min-h-[44px]"
          onClick={() => handleModeSwitch('amount')}
        >
          $
        </Button>
        <Button
          variant={tax.mode === 'percent' ? 'default' : 'outline'}
          size="sm"
          className="min-h-[44px]"
          onClick={() => handleModeSwitch('percent')}
        >
          %
        </Button>
        <div className="flex items-center gap-1">
          {tax.mode === 'amount' && (
            <span className="text-sm text-muted-foreground">$</span>
          )}
          <Input
            value={rawValue}
            onChange={handleValueChange}
            placeholder={tax.mode === 'amount' ? '0.00' : '0'}
            aria-label={tax.mode === 'amount' ? 'Tax amount' : 'Tax percentage'}
            aria-invalid={isInvalid}
            className="w-24"
          />
          {tax.mode === 'percent' && (
            <span className="text-sm text-muted-foreground">%</span>
          )}
        </div>
        {isInvalid && (
          <p role="alert" className="text-xs text-destructive">Enter a number</p>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={tax.splitMethod === 'equal' ? 'default' : 'outline'}
            size="sm"
            className="min-h-[44px]"
            onClick={() => setTax({ splitMethod: 'equal' })}
          >
            Equal
          </Button>
          <Button
            variant={tax.splitMethod === 'proportional' ? 'default' : 'outline'}
            size="sm"
            className="min-h-[44px]"
            onClick={() => setTax({ splitMethod: 'proportional' })}
          >
            Proportional
          </Button>
        </div>
      </div>
    </div>
  )
}
