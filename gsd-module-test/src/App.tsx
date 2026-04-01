import { useBillStore } from '@/store/useBillStore'
import { PeoplePanel } from '@/components/PeoplePanel/PeoplePanel'
import { ItemsPanel } from '@/components/ItemsPanel/ItemsPanel'
import { ChargesPanel } from '@/components/ChargesPanel/ChargesPanel'

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
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Expense Splitter</h1>
      <div className="flex gap-6 mb-6">
        <PeoplePanel />
        <ItemsPanel />
      </div>
      <ChargesPanel />
    </div>
  )
}
