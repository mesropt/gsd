import { TipControl } from './TipControl'
import { TaxControl } from './TaxControl'

export function ChargesPanel() {
  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-4">Charges</h2>
      <div className="flex flex-col gap-4">
        <TipControl />
        <TaxControl />
      </div>
    </div>
  )
}
