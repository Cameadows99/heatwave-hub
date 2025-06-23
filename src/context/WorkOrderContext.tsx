'use client'
import { createContext, useContext, useState } from 'react';
import type { WorkOrder } from '@/components/WorkOrderForm';

type WorkOrdersByCategory = Record<string, WorkOrder[]>

const WorkOrderContext = createContext<{
    workOrders: WorkOrdersByCategory
    addWorkOrder: (wo: WorkOrder) => void
}> ({
    workOrders: {},
    addWorkOrder: () => {},
})

export const WorkOrderProvider = ({children}: {children: React.ReactNode}) => {
    const [workOrders, setWorkOrders] = useState<WorkOrdersByCategory>({})

    const addWorkOrder = (newWO: WorkOrder) => {
        const key = newWO.category.toLowerCase()
        setWorkOrders(prev => ({
            [key]: [...(prev[key] || []), newWO],
        }))
    }

    return(
        <WorkOrderContext.Provider value={{workOrders, addWorkOrder}}>
            {children}
        </WorkOrderContext.Provider>
    )
}

export const useWorkOrders = () => (useContext(WorkOrderContext))