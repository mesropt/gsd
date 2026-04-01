import { useBillStore } from '@/store/useBillStore'
import { PeoplePanel } from '@/components/PeoplePanel/PeoplePanel'
import { ItemsPanel } from '@/components/ItemsPanel/ItemsPanel'
import { ChargesPanel } from '@/components/ChargesPanel/ChargesPanel'
import { SubtotalsStrip } from '@/components/SubtotalsStrip/SubtotalsStrip'
import { SummaryPanel } from '@/components/SummaryPanel/SummaryPanel'

// Expose store on window for browser console verification
// Usage: window.__store__.getState().resetBill()
declare global {
  interface Window {
    __store__: typeof useBillStore
  }
}
window.__store__ = useBillStore

export default function App() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Expense Splitter</h1>
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <PeoplePanel />
        <ItemsPanel />
      </div>
      <SubtotalsStrip />
      <ChargesPanel />
      <SummaryPanel />
    </div>
  )
}
