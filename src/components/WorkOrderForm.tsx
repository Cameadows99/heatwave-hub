'use client'

import { useState } from 'react'

export type WorkOrderCategory =
  | 'Service'
  | 'Construction'
  | 'Vermiculite'
  | 'Stores'
  | 'Liners'
  | 'Sales'
  | 'Other'

  export interface WorkOrder {
    customerName: string
    customerAddress: string
    customerPhone: string
    date: string
    writtenBy: string
    description: string
    category: WorkOrderCategory | string
  };

  interface WorkOrderFormProps {
    onSubmit: (data: WorkOrder) => void
  }

  export default function WorkOrderForm({onSubmit}: WorkOrderFormProps) {
    const [formData, setFormData] = useState<WorkOrder>({
        customerName: '',
    customerAddress: '',
    customerPhone: '',
    date: '',
    writtenBy: 'Cassidy', // Temp autofill, can hook into user context later
    description: '',
    category: 'Service',
    })
  

  const [customCategory, setCustomCategory] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'Other') {
      setFormData((prev) => ({ ...prev, category: '' }))
    } else {
      setFormData((prev) => ({ ...prev, category: value }))
      setCustomCategory('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalData = {
      ...formData,
      category: formData.category === '' ? customCategory : formData.category,
    }
    onSubmit(finalData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <input
        type="text"
        name="customerName"
        placeholder="Customer Name"
        value={formData.customerName}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="customerAddress"
        placeholder="Customer Address"
        value={formData.customerAddress}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="tel"
        name="customerPhone"
        placeholder="Customer Phone"
        value={formData.customerPhone}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="writtenBy"
        placeholder="Written By"
        value={formData.writtenBy}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded h-28"
      />
      <select
        name="category"
        value={formData.category === '' ? 'Other' : formData.category}
        onChange={handleCategoryChange}
        className="w-full border p-2 rounded"
      >
        <option value="Service">Service</option>
        <option value="Construction">Construction</option>
        <option value="Vermiculite">Vermiculite</option>
        <option value="Stores">Stores</option>
        <option value="Liners">Liners</option>
        <option value="Sales">Sales</option>
        <option value="Other">Other</option>
      </select>
      {formData.category === '' && (
        <input
          type="text"
          placeholder="Enter custom category"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      )}
      <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded">
        Submit Work Order
      </button>
    </form>
  )
  }