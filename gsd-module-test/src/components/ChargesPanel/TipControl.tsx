import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'

const PRESETS = [15, 18, 20] as const

export function TipControl() {
  const tip = useBillStore((s) => s.tip)
  const setTip = useBillStore((s) => s.setTip)

  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)

  function handlePresetClick(percent: number) {
    setIsCustom(false)
    setCustomValue('')
    setIsInvalid(false)
    setTip({ value: percent, mode: 'percent' })
  }

  function handleCustomClick() {
    setIsCustom(true)
    setTip({ value: 0, mode: 'percent' })
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setCustomValue(val)
    if (val === '') {
      setIsInvalid(false)
      setTip({ value: 0 })
      return
    }
    const parsed = parseFloat(val)
    if (isNaN(parsed) || parsed < 0) {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
      setTip({ value: parsed, mode: 'percent' })
    }
  }

  const activePreset = !isCustom ? tip.value : null

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium w-8">Tip</span>
        {PRESETS.map((p) => (
          <Button
            key={p}
            variant={activePreset === p ? 'default' : 'outline'}
            size="sm"
            className="min-h-[44px]"
            onClick={() => handlePresetClick(p)}
          >
            {p}%
          </Button>
        ))}
        <Button
          variant={isCustom ? 'default' : 'outline'}
          size="sm"
          className="min-h-[44px]"
          onClick={handleCustomClick}
        >
          Custom
        </Button>
        {isCustom && (
          <div className="flex items-center gap-1">
            <Input
              value={customValue}
              onChange={handleCustomChange}
              placeholder="0"
              aria-label="Custom tip percentage"
              aria-invalid={isInvalid}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
        {isCustom && isInvalid && (
          <p role="alert" className="text-xs text-destructive">Enter a number</p>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={tip.splitMethod === 'equal' ? 'default' : 'outline'}
            size="sm"
            className="min-h-[44px]"
            onClick={() => setTip({ splitMethod: 'equal' })}
          >
            Equal
          </Button>
          <Button
            variant={tip.splitMethod === 'proportional' ? 'default' : 'outline'}
            size="sm"
            className="min-h-[44px]"
            onClick={() => setTip({ splitMethod: 'proportional' })}
          >
            Proportional
          </Button>
        </div>
      </div>
    </div>
  )
}
