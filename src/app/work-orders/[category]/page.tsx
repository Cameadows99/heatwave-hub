'use client'

import { useParams } from 'next/navigation'
import type { WorkOrder } from '@/components/WorkOrderForm'
import { useWorkOrders } from '@/context/WorkOrderContext'

export default function CategoryPage() {
  const params = useParams()
  const category = (params?.category as string | undefined)?.toLowerCase()
  const { workOrders } = useWorkOrders()

  if (!category) {
    return <p className="p-6 text-red-600">Category not specified.</p>
  }

  const data: WorkOrder[] = workOrders[category] || []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-700 mb-4 capitalize">
        {category} Work Orders
      </h1>
      {data.length === 0 ? (
        <p>No work orders in this category.</p>
      ) : (
        <div className="space-y-4">
          {data.map((order, i) => (
            <div key={i} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{order.customerName}</h2>
              <p className="text-sm text-gray-600">{order.date} • {order.category}</p>
              <p className="mt-1 text-sm">Address: {order.customerAddress}</p>
              <p className="text-sm">Phone: {order.customerPhone}</p>
              <p className="text-sm">Written by: {order.writtenBy}</p>
              <p className="mt-2 text-sm italic">"{order.description}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
