'use client'

import { useState } from 'react'
import type { WorkOrder } from '@/components/WorkOrderForm'
import { useWorkOrders } from '@/context/WorkOrderContext'

export default function BrowseWorkOrdersPage() {
  const [filters, setFilters] = useState({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    date: '',
    writtenBy: '',
    category: '',
  })

  const { workOrders } = useWorkOrders()
  const allOrders: WorkOrder[] = Object.values(workOrders).flat()

  const filtered = allOrders.filter((order) => {
    return (
      (!filters.customerName || order.customerName.includes(filters.customerName)) &&
      (!filters.customerAddress || order.customerAddress.includes(filters.customerAddress)) &&
      (!filters.customerPhone || order.customerPhone.includes(filters.customerPhone)) &&
      (!filters.date || order.date === filters.date) &&
      (!filters.writtenBy || order.writtenBy.includes(filters.writtenBy)) &&
      (!filters.category || order.category === filters.category)
    )
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-sky-700 mb-4">Browse Work Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <input
          name="customerName"
          value={filters.customerName}
          onChange={handleChange}
          placeholder="Customer Name"
          className="border p-2 rounded"
        />
        <input
          name="customerAddress"
          value={filters.customerAddress}
          onChange={handleChange}
          placeholder="Customer Address"
          className="border p-2 rounded"
        />
        <input
          name="customerPhone"
          value={filters.customerPhone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="writtenBy"
          value={filters.writtenBy}
          onChange={handleChange}
          placeholder="Written By"
          className="border p-2 rounded"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="Service">Service</option>
          <option value="Construction">Construction</option>
          <option value="Vermiculite">Vermiculite</option>
          <option value="Stores">Stores</option>
          <option value="Liners">Liners</option>
          <option value="Sales">Sales</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <p>No matching work orders found.</p>}
        {filtered.map((order, i) => (
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
    </div>
  )
}
