'use client'

import { useState } from 'react'
import WorkOrderForm, { WorkOrder } from '@/components/WorkOrderForm'
import { useWorkOrders } from '@/context/WorkOrderContext'

export default function CreateWorkOrderPage() {
  const [workOrders, setWorkOrders] = useState<Record<string, WorkOrder[]>>({})
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const { addWorkOrder } = useWorkOrders();

  const handleSubmit = (newOrder: WorkOrder) => {
    addWorkOrder(newOrder);
    setConfirmation(`Work order for ${newOrder.customerName} created`)

    // Optional: reset confirmation after a few seconds
    setTimeout(() => setConfirmation(null), 5000)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-sky-700">Create a Work Order</h1>
      <WorkOrderForm onSubmit={handleSubmit} />
      {confirmation && (
        <p className="mt-4 text-green-600 font-semibold">{confirmation}</p>
      )}
    </div>
  )
}
