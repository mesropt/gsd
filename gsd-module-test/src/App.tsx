import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'

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
      <div className="flex gap-4 items-center max-w-sm">
        <Input placeholder="Enter a name..." />
        <Button>Add Person</Button>
      </div>
    </div>
  )
}
