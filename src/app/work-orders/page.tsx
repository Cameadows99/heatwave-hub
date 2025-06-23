'use client'

import Link from 'next/link'
import { useWorkOrders } from '@/context/WorkOrderContext'

const defaultCategories = [
  'service',
  'construction',
  'vermiculite',
  'stores',
  'liners',
]

export default function WorkOrdersIndexPage() {
  const { workOrders } = useWorkOrders()
  const dynamicCategories = Object.keys(workOrders)

  // Combine defaults and any additional custom categories
  const allCategories = Array.from(
    new Set([...defaultCategories, ...dynamicCategories])
  )

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-sky-700 mb-6">Work Orders</h1>

      <div className="space-y-4">
        <Link
          href="/work-orders/create"
          className="inline-block bg-sky-600 text-white px-4 py-2 rounded shadow"
        >
          ➕ Create New Work Order
        </Link>

        <Link
          href="/work-orders/browse"
          className="block text-sky-700 hover:underline font-medium"
        >
          📋 All Work Orders
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allCategories.map((category) => (
            <Link
              key={category}
              href={`/work-orders/${category}`}
              className="block p-4 border rounded shadow hover:bg-sky-50 capitalize"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
